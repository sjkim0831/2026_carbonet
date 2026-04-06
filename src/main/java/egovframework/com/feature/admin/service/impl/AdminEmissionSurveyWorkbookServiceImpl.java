package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.feature.admin.dto.request.EmissionSurveyCaseSaveRequest;
import egovframework.com.feature.admin.mapper.AdminEmissionSurveyDraftMapper;
import egovframework.com.feature.admin.service.AdminEmissionSurveyWorkbookService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service("adminEmissionSurveyWorkbookService")
public class AdminEmissionSurveyWorkbookServiceImpl extends EgovAbstractServiceImpl implements AdminEmissionSurveyWorkbookService {

    private static final String MENU_CODE = "A0020110";
    private static final String DEFAULT_WORKBOOK_NAME = "데이터 수집 설문지 excel 양식_steel, electric, low-alloy.xlsx";
    private static final Path WORKSPACE_SAMPLE = Path.of("/opt/projects/carbonet", DEFAULT_WORKBOOK_NAME);
    private static final Path REFERENCE_SAMPLE = Path.of("/opt/reference/수식 설계 요", DEFAULT_WORKBOOK_NAME);
    private static final Path DRAFT_REGISTRY_PATH = Path.of("data", "admin", "emission-survey-admin", "case-drafts.json");
    private static final List<String> WORKBOOK_GUIDANCE = List.of(
            "탭 3. 투입물 데이터 수집과 4. 산출물 데이터 수집의 우측 예시 영역을 seed 데이터로 사용합니다.",
            "Case 3-1 시작은 업로드 엑셀 값을 기본 행으로 채우고 이후 행 추가, 수정, 삭제가 가능합니다.",
            "Case 3-2 LCI DB를 알고 있는 경우는 동일한 컬럼 구조를 유지한 빈 데이터 섹션으로 시작합니다."
    );

    private static final List<SectionConfig> SECTION_CONFIGS = List.of(
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_RAW_MATERIALS", "원료 물질 및 보조 물질", 3, 7, 72, 84, 9, 11, 12, 30),
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_ENERGY", "에너지", 3, 7, 72, 77, 34, 35, 35, 36),
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_STEAM", "에너지 스팀", 3, 7, 72, 84, 38, 39, 39, 39),
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_MISC", "기타", 3, 7, 72, 77, 43, 43, 44, 45),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_PRODUCTS", "제품 및 부산물", 3, 8, 69, 80, 10, 10, 11, 12),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_AIR", "대기 배출물", 3, 8, 69, 80, 16, 16, 17, 17),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_WATER", "수계 배출물", 3, 8, 69, 80, 58, 58, 59, 62),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_WASTE", "폐기물", 3, 8, 69, 80, 73, 75, 76, 76)
    );

    private final DataFormatter formatter = new DataFormatter(Locale.KOREA);
    private final ObjectMapper objectMapper;
    private final AdminEmissionSurveyDraftMapper adminEmissionSurveyDraftMapper;

    public AdminEmissionSurveyWorkbookServiceImpl(ObjectMapper objectMapper,
                                                 AdminEmissionSurveyDraftMapper adminEmissionSurveyDraftMapper) {
        this.objectMapper = objectMapper;
        this.adminEmissionSurveyDraftMapper = adminEmissionSurveyDraftMapper;
    }

    @Override
    public Map<String, Object> getPagePayload(boolean isEn) {
        Path samplePath = resolveSamplePath();
        if (samplePath == null) {
            return basePayload(isEn, null, false, List.of());
        }
        try (InputStream inputStream = Files.newInputStream(samplePath);
             Workbook workbook = new XSSFWorkbook(inputStream)) {
            return buildPayload(workbook, samplePath.getFileName().toString(), samplePath.toString(), REFERENCE_SAMPLE.toString(), false, isEn);
        } catch (Exception e) {
            return basePayload(isEn, samplePath.toString(), false, List.of());
        }
    }

    @Override
    public Map<String, Object> parseWorkbook(MultipartFile uploadFile, boolean isEn) {
        Objects.requireNonNull(uploadFile, "uploadFile");
        validateUploadFile(uploadFile, isEn);
        try (InputStream inputStream = new ByteArrayInputStream(uploadFile.getBytes());
             Workbook workbook = new XSSFWorkbook(inputStream)) {
            return buildPayload(workbook, uploadFile.getOriginalFilename(), WORKSPACE_SAMPLE.toString(), REFERENCE_SAMPLE.toString(), true, isEn);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException(isEn
                    ? "Failed to parse the uploaded workbook. Please upload a valid .xlsx file."
                    : "업로드한 워크북을 파싱하지 못했습니다. 올바른 .xlsx 파일인지 확인해 주세요.", e);
        }
    }

    @Override
    public synchronized Map<String, Object> saveCaseDraft(EmissionSurveyCaseSaveRequest request, String actorId, boolean isEn) {
        String sectionCode = safe(request.getSectionCode());
        String caseCode = safe(request.getCaseCode());
        if (sectionCode.isEmpty() || caseCode.isEmpty()) {
            throw new IllegalArgumentException(isEn ? "Section code and case code are required." : "sectionCode와 caseCode는 필수입니다.");
        }
        Map<String, Map<String, Object>> registry = readDraftRegistry();
        String draftKey = sectionCode + ":" + caseCode;
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("sectionCode", sectionCode);
        row.put("caseCode", caseCode);
        row.put("majorCode", safe(request.getMajorCode()));
        row.put("sectionLabel", safe(request.getSectionLabel()));
        row.put("sourceFileName", safe(request.getSourceFileName()));
        row.put("sourcePath", safe(request.getSourcePath()));
        row.put("targetPath", safe(request.getTargetPath()));
        row.put("titleRowLabel", safe(request.getTitleRowLabel()));
        row.put("guidance", request.getGuidance() == null ? List.of() : request.getGuidance());
        row.put("columns", request.getColumns() == null ? List.of() : request.getColumns());
        row.put("actorId", safe(actorId));
        row.put("savedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        row.put("rows", request.getRows() == null ? List.of() : request.getRows());
        registry.put(draftKey, row);
        writeDraftRegistry(registry);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("saved", true);
        response.put("draftKey", draftKey);
        response.put("savedAt", row.get("savedAt"));
        response.put("storageMode", isDraftTableReady() ? "database+file" : "file");
        response.put("message", isEn ? "Survey case draft saved." : "설문 케이스 초안을 저장했습니다.");
        if (isDraftTableReady()) {
            saveCaseDraftToDatabase(request, actorId);
            response.put("savedCaseMap", readDraftRegistry());
        } else {
            response.put("savedCaseMap", registry);
        }
        return response;
    }

    private void validateUploadFile(MultipartFile uploadFile, boolean isEn) {
        if (uploadFile.isEmpty()) {
            throw new IllegalArgumentException(isEn
                    ? "The upload file is empty."
                    : "업로드 파일이 비어 있습니다.");
        }
        String originalFilename = uploadFile.getOriginalFilename();
        String lowerName = originalFilename == null ? "" : originalFilename.toLowerCase(Locale.ROOT);
        if (!lowerName.endsWith(".xlsx")) {
            throw new IllegalArgumentException(isEn
                    ? "Only .xlsx workbooks are supported."
                    : ".xlsx 형식의 워크북만 지원합니다.");
        }
    }

    private Map<String, Object> buildPayload(Workbook workbook,
                                             String sourceFileName,
                                             String sourcePath,
                                             String targetPath,
                                             boolean uploaded,
                                             boolean isEn) {
        List<Map<String, Object>> sections = new ArrayList<>();
        LinkedHashSet<String> majorCodes = new LinkedHashSet<>();
        LinkedHashMap<String, String> sectionOptions = new LinkedHashMap<>();

        for (SectionConfig config : SECTION_CONFIGS) {
            Sheet sheet = workbook.getSheet(config.sheetName);
            if (sheet == null) {
                continue;
            }
            Map<String, Object> section = parseSection(sheet, config);
            sections.add(section);
            majorCodes.add(config.majorCode);
            sectionOptions.put(config.sectionCode, config.sectionLabel);
        }

        Map<String, Object> payload = basePayload(isEn, sourcePath, uploaded, sections);
        payload.put("sourceFileName", sourceFileName == null || sourceFileName.isBlank() ? DEFAULT_WORKBOOK_NAME : sourceFileName);
        payload.put("targetPath", targetPath);
        payload.put("majorOptions", List.of(
                option("INPUT", "3. 투입물 데이터 수집"),
                option("OUTPUT", "4. 산출물 데이터 수집")
        ));
        payload.put("sectionOptions", sectionOptions.entrySet().stream()
                .map(entry -> option(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList()));
        payload.put("caseOptions", List.of(
                option("CASE_3_1", "3-1 시작"),
                option("CASE_3_2", "3-2 LCI DB를 알고 있는 경우")
        ));
        payload.put("summaryCards", List.of(
                summaryCard("원본 파일", payload.get("sourceFileName"), uploaded ? "업로드된 워크북 기준" : "기본 참조 워크북 기준"),
                summaryCard("대분류", String.valueOf(majorCodes.size()), "투입물/산출물 2개 분류"),
                summaryCard("중분류", String.valueOf(sectionOptions.size()), "엑셀에서 추출한 데이터 섹션 수"),
                summaryCard("Case", "2", "3-1 seed / 3-2 empty draft")
        ));
        return payload;
    }

    private Map<String, Object> basePayload(boolean isEn, String sourcePath, boolean uploaded, List<Map<String, Object>> sections) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("menuCode", MENU_CODE);
        payload.put("pageTitle", isEn ? "Emission Survey Management" : "배출 설문 관리");
        payload.put("pageDescription", isEn
                ? "Upload the workbook, inspect sections from tabs 3 and 4, and build paired 3-1/3-2 cases."
                : "엑셀을 업로드하고 탭 3, 4의 섹션을 읽어 3-1/3-2 케이스 편집 화면을 구성합니다.");
        payload.put("sourcePath", sourcePath == null ? "" : sourcePath);
        payload.put("uploaded", uploaded);
        payload.put("workbookGuidance", WORKBOOK_GUIDANCE);
        payload.put("sections", sections);
        payload.put("savedCaseMap", readDraftRegistry());
        return payload;
    }

    private Map<String, Object> parseSection(Sheet sheet, SectionConfig config) {
        List<Map<String, String>> columns = parseColumns(sheet, config);
        List<Map<String, Object>> rows = parseRows(sheet, config, columns);
        Map<String, Object> section = new LinkedHashMap<>();
        section.put("sectionCode", config.sectionCode);
        section.put("majorCode", config.majorCode);
        section.put("majorLabel", config.majorLabel);
        section.put("sectionLabel", config.sectionLabel);
        section.put("sheetName", config.sheetName);
        section.put("titleRowLabel", readMergedValue(sheet, config.headerStartRow - 1, config.startCol + 1));
        section.put("guidance", readGuidance(sheet, config.guidanceStartRow, config.guidanceEndRow, config.startCol - 3, config.startCol - 2));
        section.put("columns", columns);
        section.put("rows", rows);
        return section;
    }

    private List<Map<String, String>> parseColumns(Sheet sheet, SectionConfig config) {
        List<Map<String, String>> columns = new ArrayList<>();
        for (int colIndex = config.startCol; colIndex <= config.endCol; colIndex++) {
            LinkedHashSet<String> labels = new LinkedHashSet<>();
            for (int rowIndex = config.headerStartRow; rowIndex <= config.headerEndRow; rowIndex++) {
                String value = normalizeLabel(readMergedValue(sheet, rowIndex, colIndex));
                if (!value.isBlank() && !"…".equals(value) && !"...".equals(value)) {
                    labels.add(value);
                }
            }
            if (labels.isEmpty()) {
                continue;
            }
            String label = String.join(" / ", labels);
            Map<String, String> column = new LinkedHashMap<>();
            column.put("key", sanitizeKey(label, colIndex));
            column.put("label", label);
            columns.add(column);
        }
        return columns;
    }

    private List<Map<String, Object>> parseRows(Sheet sheet, SectionConfig config, List<Map<String, String>> columns) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (int rowIndex = config.dataStartRow; rowIndex <= config.dataEndRow; rowIndex++) {
            Map<String, String> values = new LinkedHashMap<>();
            boolean hasMeaningfulValue = false;
            int colPointer = 0;
            for (int colIndex = config.startCol; colIndex <= config.endCol; colIndex++) {
                if (colPointer >= columns.size()) {
                    break;
                }
                String label = columns.get(colPointer).get("label");
                String key = columns.get(colPointer).get("key");
                String value = normalizeValue(readMergedValue(sheet, rowIndex, colIndex));
                if (!label.isBlank()) {
                    values.put(key, value);
                    if (!value.isBlank() && !"…".equals(value) && !"...".equals(value)) {
                        hasMeaningfulValue = true;
                    }
                    colPointer++;
                }
            }
            if (!hasMeaningfulValue) {
                continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rowId", config.sectionCode + "_" + (rowIndex + 1));
            row.put("values", values);
            rows.add(row);
        }
        return rows;
    }

    private List<String> readGuidance(Sheet sheet, int startRow, int endRow, int markerCol, int textCol) {
        List<String> guidance = new ArrayList<>();
        for (int rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            String marker = normalizeValue(readMergedValue(sheet, rowIndex, markerCol));
            String text = normalizeValue(readMergedValue(sheet, rowIndex, textCol));
            if (text.isBlank()) {
                continue;
            }
            guidance.add(marker.isBlank() ? text : marker + " " + text);
        }
        return guidance;
    }

    private String readMergedValue(Sheet sheet, int rowIndex, int colIndex) {
        if (sheet == null || rowIndex < 0 || colIndex < 0) {
            return "";
        }
        for (CellRangeAddress region : sheet.getMergedRegions()) {
            if (region.isInRange(rowIndex, colIndex)) {
                Row row = sheet.getRow(region.getFirstRow());
                if (row == null) {
                    return "";
                }
                Cell cell = row.getCell(region.getFirstColumn());
                return cell == null ? "" : formatter.formatCellValue(cell).trim();
            }
        }
        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            return "";
        }
        Cell cell = row.getCell(colIndex);
        return cell == null ? "" : formatter.formatCellValue(cell).trim();
    }

    private String sanitizeKey(String label, int colIndex) {
        String normalized = label.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9가-힣]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
        if (normalized.isBlank()) {
            return "column_" + colIndex;
        }
        return normalized;
    }

    private String normalizeLabel(String value) {
        return value == null ? "" : value.replace("\n", " ").replace("\r", " ").trim();
    }

    private String normalizeValue(String value) {
        return value == null ? "" : value.replace("\r", " ").replace("\n", " ").trim();
    }

    private Map<String, String> option(String value, String label) {
        Map<String, String> option = new LinkedHashMap<>();
        option.put("value", value);
        option.put("label", label);
        return option;
    }

    private Map<String, String> summaryCard(Object title, Object value, Object description) {
        Map<String, String> card = new LinkedHashMap<>();
        card.put("title", String.valueOf(title));
        card.put("value", String.valueOf(value));
        card.put("description", String.valueOf(description));
        return card;
    }

    private Path resolveSamplePath() {
        if (Files.exists(REFERENCE_SAMPLE)) {
            return REFERENCE_SAMPLE;
        }
        if (Files.exists(WORKSPACE_SAMPLE)) {
            return WORKSPACE_SAMPLE;
        }
        return null;
    }

    private Map<String, Map<String, Object>> readDraftRegistry() {
        if (isDraftTableReady()) {
            return readDraftRegistryFromDatabase();
        }
        return readDraftRegistryFromFile();
    }

    private Map<String, Map<String, Object>> readDraftRegistryFromDatabase() {
        try {
            Map<String, Map<String, Object>> result = new LinkedHashMap<>();
            List<Map<String, Object>> headers = adminEmissionSurveyDraftMapper.selectCaseHeaders();
            for (Map<String, Object> header : headers) {
                String caseId = safeObject(header.get("caseId"));
                String sectionCode = safeObject(header.get("sectionCode"));
                String caseCode = safeObject(header.get("caseCode"));
                String key = sectionCode + ":" + caseCode;
                Map<String, Object> row = new LinkedHashMap<>(header);
                List<Map<String, Object>> items = adminEmissionSurveyDraftMapper.selectCaseRows(caseId);
                List<Map<String, Object>> rows = new ArrayList<>();
                for (Map<String, Object> item : items) {
                    Map<String, Object> draftRow = new LinkedHashMap<>();
                    draftRow.put("rowId", safeObject(item.get("rowKey")));
                    draftRow.put("values", parseJsonMap(safeObject(item.get("rowValuesJson"))));
                    rows.add(draftRow);
                }
                row.put("columns", parseJsonListOfMaps(safeObject(header.get("rowSchemaJson"))));
                row.put("guidance", parseJsonStringList(safeObject(header.get("guidanceJson"))));
                row.put("rows", rows);
                result.put(key, row);
            }
            return result;
        } catch (Exception e) {
            return readDraftRegistryFromFile();
        }
    }

    private Map<String, Map<String, Object>> readDraftRegistryFromFile() {
        if (!Files.exists(DRAFT_REGISTRY_PATH)) {
            return new LinkedHashMap<>();
        }
        try (InputStream inputStream = Files.newInputStream(DRAFT_REGISTRY_PATH)) {
            Map<String, Map<String, Object>> value = objectMapper.readValue(
                    inputStream,
                    new TypeReference<LinkedHashMap<String, Map<String, Object>>>() {}
            );
            return value == null ? new LinkedHashMap<>() : value;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to read emission survey draft registry", e);
        }
    }

    private void writeDraftRegistry(Map<String, Map<String, Object>> registry) {
        try {
            Files.createDirectories(DRAFT_REGISTRY_PATH.getParent());
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(DRAFT_REGISTRY_PATH.toFile(), registry);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to write emission survey draft registry", e);
        }
    }

    private void saveCaseDraftToDatabase(EmissionSurveyCaseSaveRequest request, String actorId) {
        try {
            String caseId = buildCaseId(request.getSectionCode(), request.getCaseCode());
            Map<String, Object> header = new LinkedHashMap<>();
            header.put("caseId", caseId);
            header.put("sectionCode", safe(request.getSectionCode()));
            header.put("caseCode", safe(request.getCaseCode()));
            header.put("majorCode", safe(request.getMajorCode()));
            header.put("sectionLabel", safe(request.getSectionLabel()));
            header.put("sourceFileName", safe(request.getSourceFileName()).isBlank() ? DEFAULT_WORKBOOK_NAME : safe(request.getSourceFileName()));
            header.put("sourcePath", safe(request.getSourcePath()).isBlank() ? WORKSPACE_SAMPLE.toString() : safe(request.getSourcePath()));
            header.put("targetPath", safe(request.getTargetPath()).isBlank() ? REFERENCE_SAMPLE.toString() : safe(request.getTargetPath()));
            header.put("caseStatus", "SAVED");
            header.put("rowCount", request.getRows() == null ? 0 : request.getRows().size());
            header.put("rowSchemaJson", writeJson(request.getColumns() == null ? List.of() : request.getColumns()));
            header.put("guidanceJson", writeJson(request.getGuidance() == null ? List.of() : request.getGuidance()));
            header.put("actorId", safe(actorId));
            int updated = adminEmissionSurveyDraftMapper.updateCaseHeader(header);
            if (updated <= 0) {
                adminEmissionSurveyDraftMapper.insertCaseHeader(header);
            }
            adminEmissionSurveyDraftMapper.deleteCaseRows(caseId);
            if (request.getRows() == null) {
                return;
            }
            int order = 1;
            for (Map<String, Object> draftRow : request.getRows()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("caseRowId", "ESR_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase(Locale.ROOT));
                row.put("caseId", caseId);
                row.put("rowOrder", order++);
                row.put("rowKey", safeObject(draftRow.get("rowId")));
                row.put("rowValuesJson", writeJson(draftRow.get("values")));
                row.put("actorId", safe(actorId));
                adminEmissionSurveyDraftMapper.insertCaseRow(row);
            }
        } catch (Exception ignored) {
            // Keep file-based fallback behavior when DB tables are absent or unavailable.
        }
    }

    private boolean isDraftTableReady() {
        try {
            return adminEmissionSurveyDraftMapper != null && adminEmissionSurveyDraftMapper.countCaseTable() >= 0;
        } catch (Exception e) {
            return false;
        }
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String safeObject(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> parseJsonMap(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new LinkedHashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<LinkedHashMap<String, String>>() {});
        } catch (Exception e) {
            return new LinkedHashMap<>();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Map.of() : value);
        } catch (Exception e) {
            return "{}";
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, String>> parseJsonListOfMaps(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, String>>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<String> parseJsonStringList(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String buildCaseId(String sectionCode, String caseCode) {
        return "ESC_" + Math.abs((safe(sectionCode) + ":" + safe(caseCode)).hashCode());
    }

    private static final class SectionConfig {
        private final String sheetName;
        private final String majorCode;
        private final String majorLabel;
        private final String sectionCode;
        private final String sectionLabel;
        private final int guidanceStartRow;
        private final int guidanceEndRow;
        private final int startCol;
        private final int endCol;
        private final int headerStartRow;
        private final int headerEndRow;
        private final int dataStartRow;
        private final int dataEndRow;

        private SectionConfig(String sheetName,
                              String majorCode,
                              String majorLabel,
                              String sectionCode,
                              String sectionLabel,
                              int guidanceStartRow,
                              int guidanceEndRow,
                              int startCol,
                              int endCol,
                              int headerStartRow,
                              int headerEndRow,
                              int dataStartRow,
                              int dataEndRow) {
            this.sheetName = sheetName;
            this.majorCode = majorCode;
            this.majorLabel = majorLabel;
            this.sectionCode = sectionCode;
            this.sectionLabel = sectionLabel;
            this.guidanceStartRow = guidanceStartRow;
            this.guidanceEndRow = guidanceEndRow;
            this.startCol = startCol;
            this.endCol = endCol;
            this.headerStartRow = headerStartRow;
            this.headerEndRow = headerEndRow;
            this.dataStartRow = dataStartRow;
            this.dataEndRow = dataEndRow;
        }
    }
}
