package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.feature.admin.dto.request.EmissionSurveyCaseSaveRequest;
import egovframework.com.feature.admin.dto.request.EmissionSurveyDraftSetSaveRequest;
import egovframework.com.feature.admin.mapper.AdminEmissionSurveyDraftMapper;
import egovframework.com.feature.admin.service.AdminEmissionSurveyWorkbookService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.RegionUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
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
    private static final String TEMPLATE_MARKER_PROPERTY = "carbonetEmissionSurveyTemplate";
    private static final String TEMPLATE_MARKER_VALUE = "v2";
    private static final Path WORKSPACE_SAMPLE = Path.of("/opt/projects/carbonet", DEFAULT_WORKBOOK_NAME);
    private static final Path REFERENCE_SAMPLE = Path.of("/opt/reference/수식 설계 요", DEFAULT_WORKBOOK_NAME);
    private static final Path DRAFT_REGISTRY_PATH = Path.of("data", "admin", "emission-survey-admin", "case-drafts.json");
    private static final Path SET_REGISTRY_PATH = Path.of("data", "admin", "emission-survey-admin", "draft-sets.json");
    private static final List<String> WORKBOOK_GUIDANCE = List.of(
            "탭 3. 투입물 데이터 수집과 4. 산출물 데이터 수집의 우측 예시 영역을 seed 데이터로 사용합니다.",
            "Case 3-1 시작은 업로드 엑셀 값을 기본 행으로 채우고 이후 행 추가, 수정, 삭제가 가능합니다.",
            "Case 3-2 LCI DB를 알고 있는 경우는 동일한 컬럼 구조를 유지한 빈 데이터 섹션으로 시작합니다."
    );
    private static final Map<String, List<FixedColumnConfig>> FIXED_SECTION_COLUMNS = Map.of(
            "INPUT_RAW_MATERIALS", List.of(
                    fixedColumn("group", "구분", "BU"),
                    fixedColumn("materialName", "물질명", "BV"),
                    fixedColumn("amount", "양", "BW"),
                    fixedColumn("annualUnit", "단위\n(연간)", "BX"),
                    fixedColumn("usage", "용도", "BY"),
                    fixedColumn("origin", "원산지\n(국가/업체명)", "BZ",
                            "원료물질 수송 (원료 물질에만 기입하여 주시기 바랍니다.)",
                            "원산지\n(국가/업체명)"),
                    fixedColumn("marineTransport", "해양", "CA",
                            "원료물질 수송 (원료 물질에만 기입하여 주시기 바랍니다.)",
                            "수송방법",
                            "해양"),
                    fixedColumn("marineTonKm", "물동량\n(ton · km)", "CB",
                            "원료물질 수송 (원료 물질에만 기입하여 주시기 바랍니다.)",
                            "수송방법",
                            "물동량\n(ton · km)"),
                    fixedColumn("roadTransport", "육로", "CC",
                            "원료물질 수송 (원료 물질에만 기입하여 주시기 바랍니다.)",
                            "수송방법",
                            "육로"),
                    fixedColumn("roadTonKm", "물동량\n(ton · km)", "CD",
                            "원료물질 수송 (원료 물질에만 기입하여 주시기 바랍니다.)",
                            "수송방법",
                            "물동량\n(ton · km)"),
                    fixedColumn("transportRoute", "운송경로", "CE",
                            "원료물질 수송 (원료 물질에만 기입하여 주시기 바랍니다.)",
                            "운송경로"),
                    fixedColumn("remark", "비고", "CF",
                            "원료물질 수송 (원료 물질에만 기입하여 주시기 바랍니다.)",
                            "비고")
            ),
            "INPUT_ENERGY", List.of(
                    fixedColumn("group", "구분", "BU"),
                    fixedColumn("materialName", "물질명", "BV"),
                    fixedColumn("amount", "양", "BW"),
                    fixedColumn("annualUnit", "단위(연간)", "BX"),
                    fixedColumn("usage", "용도", "BY"),
                    fixedColumn("remark", "비고", "BZ")
            ),
            "INPUT_STEAM", List.of(
                    fixedColumn("group", "구분", "BU"),
                    fixedColumn("materialName", "물질명", "BV"),
                    fixedColumn("amount", "양", "BW"),
                    fixedColumn("annualUnit", "단위(연간)", "BX"),
                    fixedColumn("usage", "용도", "BY"),
                    fixedColumn("steamType", "스팀종류\n(포화증기/습증기/과열증기)", "BZ"),
                    fixedColumn("steamMass", "스팀의 질량", "CA"),
                    fixedColumn("condensateMass", "응축수 질량", "CB"),
                    fixedColumn("condensateTemperature", "응축수\n온도", "CC"),
                    fixedColumn("steamCirculation", "스팀순환여부", "CD"),
                    fixedColumn("externalSteam", "외부스팀 여부", "CE")
            ),
            "INPUT_MISC", List.of(
                    fixedColumn("group", "구분", "BU"),
                    fixedColumn("materialName", "물질명", "BV"),
                    fixedColumn("amount", "양", "BW"),
                    fixedColumn("annualUnit", "단위(연간)", "BX"),
                    fixedColumn("usage", "용도", "BY"),
                    fixedColumn("remark", "비고", "BZ")
            ),
            "OUTPUT_PRODUCTS", List.of(
                    fixedColumn("group", "구분", "BR"),
                    fixedColumn("materialName", "물질명", "BS"),
                    fixedColumn("amount", "양", "BT"),
                    fixedColumn("annualUnit", "단위\n(연간)", "BU"),
                    fixedColumn("productionCost", "생산원가", "BV"),
                    fixedColumn("costUnit", "단위", "BW"),
                    fixedColumn("remark", "비고", "BX")
            ),
            "OUTPUT_AIR", List.of(
                    fixedColumn("group", "구분", "BR"),
                    fixedColumn("materialName", "물질명", "BS"),
                    fixedColumn("amount", "양", "BT"),
                    fixedColumn("annualUnit", "단위(연간)", "BU"),
                    fixedColumn("collectionMethod", "데이터 수집 방법", "BV"),
                    fixedColumn("remark", "비고", "BW")
            ),
            "OUTPUT_WATER", List.of(
                    fixedColumn("group", "구분", "BR"),
                    fixedColumn("materialName", "물질명", "BS"),
                    fixedColumn("amount", "양", "BT"),
                    fixedColumn("annualUnit", "단위(연간)", "BU"),
                    fixedColumn("treatmentRoute", "처리경로", "BV"),
                    fixedColumn("treatmentMethod", "처리방법", "BW"),
                    fixedColumn("remark", "비고", "BX")
            ),
            "OUTPUT_WASTE", List.of(
                    fixedColumn("group", "구분", "BR"),
                    fixedColumn("materialName", "물질명", "BS"),
                    fixedColumn("amount", "양", "BT"),
                    fixedColumn("annualUnit", "단위", "BU"),
                    fixedColumn("wasteType", "구분\n(일반/지정 폐기물)", "BV"),
                    fixedColumn("treatmentMethod", "처리방법\n(매립/소각/재활용/기타)", "BX"),
                    fixedColumn("transportTonKm", "물동량", "BY",
                            "재활용 및 최종폐기 과정 수송",
                            "물동량"),
                    fixedColumn("marineTransport", "해양", "BZ",
                            "재활용 및 최종폐기 과정 수송",
                            "수송방법",
                            "해양"),
                    fixedColumn("roadTransport", "육로", "CA",
                            "재활용 및 최종폐기 과정 수송",
                            "수송방법",
                            "육로"),
                    fixedColumn("transportRoute", "운송경로", "CB",
                            "재활용 및 최종폐기 과정 수송",
                            "운송경로"),
                    fixedColumn("remark", "비고", "CC",
                            "재활용 및 최종폐기 과정 수송",
                            "비고")
            )
    );

    private static final List<SectionConfig> SECTION_CONFIGS = List.of(
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_RAW_MATERIALS", "원료 물질 및 보조 물질", 3, 7, 71, 72, 9, 74, 73, 85, 10, 12, 13, 31, List.of(), FIXED_SECTION_COLUMNS.get("INPUT_RAW_MATERIALS")),
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_ENERGY", "에너지", 3, 7, 71, 72, 34, 74, 73, 85, 35, 35, 36, 37, List.of(), FIXED_SECTION_COLUMNS.get("INPUT_ENERGY")),
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_STEAM", "에너지 스팀", 3, 7, 71, 72, 39, 74, 73, 85, 39, 39, 40, 40, List.of(), FIXED_SECTION_COLUMNS.get("INPUT_STEAM")),
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_MISC", "기타", 3, 7, 71, 72, 43, 74, 73, 85, 44, 44, 45, 46, List.of(), FIXED_SECTION_COLUMNS.get("INPUT_MISC")),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_PRODUCTS", "제품 및 부산물", 3, 8, 68, 69, 10, 71, 70, 81, 11, 11, 12, 13, List.of(), FIXED_SECTION_COLUMNS.get("OUTPUT_PRODUCTS")),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_AIR", "대기 배출물", 3, 8, 68, 69, 16, 71, 70, 81, 17, 17, 18, 53, List.of(), FIXED_SECTION_COLUMNS.get("OUTPUT_AIR")),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_WATER", "수계 배출물", 3, 8, 68, 69, 56, 71, 70, 81, 59, 59, 60, 70, List.of(
                    new SectionMetaConfig("wastewaterFacilityInstalled", "사업장 내 1차 하수처리장 설치여부", 57, 70, 58, 70)
            ), FIXED_SECTION_COLUMNS.get("OUTPUT_WATER")),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_WASTE", "폐기물", 3, 8, 68, 69, 73, 71, 70, 81, 74, 76, 77, 77, List.of(), FIXED_SECTION_COLUMNS.get("OUTPUT_WASTE"))
    );
    private static final List<SectionConfig> TEMPLATE_SECTION_CONFIGS = List.of(
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_RAW_MATERIALS", "원료 물질 및 보조 물질", 0, -1, 0, 0, 2, 1, 1, 12, 3, 5, 6, 17, List.of(), templateFixedColumns("INPUT_RAW_MATERIALS", "B")),
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_ENERGY", "에너지", 0, -1, 0, 0, 20, 1, 1, 7, 21, 21, 22, 33, List.of(), templateFixedColumns("INPUT_ENERGY", "B")),
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_STEAM", "에너지 스팀", 0, -1, 0, 0, 36, 1, 1, 11, 37, 37, 38, 49, List.of(), templateFixedColumns("INPUT_STEAM", "B")),
            new SectionConfig("투입물 데이터 수집", "INPUT", "3. 투입물 데이터 수집", "INPUT_MISC", "기타", 0, -1, 0, 0, 52, 1, 1, 7, 53, 53, 54, 65, List.of(), templateFixedColumns("INPUT_MISC", "B")),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_PRODUCTS", "제품 및 부산물", 0, -1, 0, 0, 2, 1, 1, 7, 3, 3, 4, 15, List.of(), templateFixedColumns("OUTPUT_PRODUCTS", "B")),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_AIR", "대기 배출물", 0, -1, 0, 0, 18, 1, 1, 6, 19, 19, 20, 31, List.of(), templateFixedColumns("OUTPUT_AIR", "B")),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_WATER", "수계 배출물", 0, -1, 0, 0, 34, 1, 1, 7, 37, 37, 38, 49, List.of(
                    new SectionMetaConfig("wastewaterFacilityInstalled", "사업장 내 1차 하수처리장 설치여부", 35, 1, 35, 3)
            ), templateFixedColumns("OUTPUT_WATER", "B")),
            new SectionConfig("산출물 데이터 수집", "OUTPUT", "4. 산출물 데이터 수집", "OUTPUT_WASTE", "폐기물", 0, -1, 0, 0, 52, 1, 1, 11, 53, 55, 56, 67, List.of(), templateFixedColumns("OUTPUT_WASTE", "B"))
    );

    private final DataFormatter formatter = new DataFormatter(Locale.KOREA);
    private final ObjectMapper objectMapper;
    private final AdminEmissionSurveyDraftMapper adminEmissionSurveyDraftMapper;
    private CellStyle templateCellStyle;
    private CellStyle templateTitleStyle;
    private CellStyle templateSectionStyle;
    private CellStyle templateHeaderStyle;
    private CellStyle templateMetaLabelStyle;

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

    @Override
    public synchronized Map<String, Object> deleteCaseDraft(String sectionCode, String caseCode, boolean isEn) {
        String resolvedSectionCode = safe(sectionCode);
        String resolvedCaseCode = safe(caseCode);
        if (resolvedSectionCode.isEmpty() || resolvedCaseCode.isEmpty()) {
            throw new IllegalArgumentException(isEn ? "Section code and case code are required." : "sectionCode와 caseCode는 필수입니다.");
        }
        Map<String, Map<String, Object>> registry = readDraftRegistryFromFile();
        registry.remove(resolvedSectionCode + ":" + resolvedCaseCode);
        writeDraftRegistry(registry);
        if (isDraftTableReady()) {
            deleteCaseDraftFromDatabase(resolvedSectionCode, resolvedCaseCode);
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("deleted", true);
        response.put("draftKey", resolvedSectionCode + ":" + resolvedCaseCode);
        response.put("savedCaseMap", readDraftRegistry());
        response.put("message", isEn ? "Survey case draft deleted." : "설문 케이스 초안을 삭제했습니다.");
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
        List<SectionConfig> sectionConfigs = resolveSectionConfigs(workbook);
        boolean generatedTemplate = isGeneratedTemplate(workbook);
        List<Map<String, Object>> sections = new ArrayList<>();
        LinkedHashSet<String> majorCodes = new LinkedHashSet<>();
        LinkedHashMap<String, String> sectionOptions = new LinkedHashMap<>();

        for (SectionConfig config : sectionConfigs) {
            Sheet sheet = workbook.getSheet(config.sheetName);
            if (sheet == null) {
                continue;
            }
            Map<String, Object> section = parseSection(sheet, config, generatedTemplate);
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
        payload.put("savedSetMap", readSetRegistry());
        return payload;
    }

    @Override
    public synchronized Map<String, Object> saveDraftSet(EmissionSurveyDraftSetSaveRequest request, String actorId, boolean isEn) {
        String setName = safe(request.getSetName());
        if (setName.isEmpty()) {
            throw new IllegalArgumentException(isEn ? "Set name is required." : "세트명은 필수입니다.");
        }
        String setId = safe(request.getSetId()).isBlank()
                ? "SET_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                : safe(request.getSetId());
        Map<String, Map<String, Object>> registry = readSetRegistry();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("setId", setId);
        row.put("setName", setName);
        row.put("sourceFileName", safe(request.getSourceFileName()));
        row.put("sourcePath", safe(request.getSourcePath()));
        row.put("targetPath", safe(request.getTargetPath()));
        row.put("actorId", safe(actorId));
        row.put("savedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        row.put("sectionCount", request.getSections() == null ? 0 : request.getSections().size());
        row.put("sections", request.getSections() == null ? List.of() : request.getSections());
        registry.put(setId, row);
        writeRegistry(SET_REGISTRY_PATH, registry);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("saved", true);
        response.put("setId", setId);
        response.put("savedAt", row.get("savedAt"));
        response.put("savedSetMap", registry);
        response.put("message", isEn ? "Draft set saved." : "초안 세트를 저장했습니다.");
        return response;
    }

    @Override
    public synchronized Map<String, Object> deleteDraftSet(String setId, boolean isEn) {
        String resolvedSetId = safe(setId);
        if (resolvedSetId.isEmpty()) {
            throw new IllegalArgumentException(isEn ? "Set id is required." : "setId는 필수입니다.");
        }
        Map<String, Map<String, Object>> registry = readSetRegistry();
        registry.remove(resolvedSetId);
        writeRegistry(SET_REGISTRY_PATH, registry);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("deleted", true);
        response.put("setId", resolvedSetId);
        response.put("savedSetMap", registry);
        response.put("message", isEn ? "Draft set deleted." : "초안 세트를 삭제했습니다.");
        return response;
    }

    private Map<String, Object> parseSection(Sheet sheet, SectionConfig config, boolean generatedTemplate) {
        List<FixedColumnConfig> fixedColumns = config.fixedColumns;
        List<Map<String, String>> columns = fixedColumns == null || fixedColumns.isEmpty()
                ? parseColumns(sheet, config)
                : parseFixedColumns(fixedColumns);
        List<Map<String, Object>> rows = fixedColumns == null || fixedColumns.isEmpty()
                ? parseRows(sheet, config, columns, generatedTemplate)
                : parseRowsByFixedColumns(sheet, config, fixedColumns, generatedTemplate);
        Map<String, Object> section = new LinkedHashMap<>();
        section.put("sectionCode", config.sectionCode);
        section.put("majorCode", config.majorCode);
        section.put("majorLabel", config.majorLabel);
        section.put("sectionLabel", config.sectionLabel);
        section.put("sheetName", config.sheetName);
        String titleRowLabel = readMergedValue(sheet, config.titleRow, config.titleCol);
        section.put("titleRowLabel", titleRowLabel.isBlank() ? config.sectionLabel : titleRowLabel);
        section.put("guidance", readGuidance(sheet, config.guidanceStartRow, config.guidanceEndRow, config.guidanceMarkerCol, config.guidanceTextCol));
        section.put("metadata", parseSectionMetadata(sheet, config));
        section.put("columns", columns);
        section.put("rows", rows);
        return section;
    }

    private List<Map<String, String>> parseFixedColumns(List<FixedColumnConfig> fixedColumns) {
        return fixedColumns.stream()
                .map(column -> column(column.key, column.label, column.headerPath))
                .collect(Collectors.toList());
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

    private List<Map<String, Object>> parseRowsByFixedColumns(Sheet sheet,
                                                              SectionConfig config,
                                                              List<FixedColumnConfig> fixedColumns,
                                                              boolean generatedTemplate) {
        List<Map<String, Object>> rows = new ArrayList<>();
        int rowEnd = resolveDataEndRow(sheet, config, generatedTemplate);
        for (int rowIndex = config.dataStartRow; rowIndex <= rowEnd; rowIndex++) {
            Map<String, String> values = new LinkedHashMap<>();
            for (FixedColumnConfig fixedColumn : fixedColumns) {
                values.put(fixedColumn.key, normalizeValue(readMergedValue(sheet, rowIndex, fixedColumn.colIndex)));
            }
            if (isExamplePlaceholderRow(values) || isEmptyRow(values)) {
                continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rowId", config.sectionCode + "_" + (rowIndex + 1));
            row.put("values", values);
            row.put("templateRow", true);
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> parseRows(Sheet sheet,
                                                SectionConfig config,
                                                List<Map<String, String>> columns,
                                                boolean generatedTemplate) {
        List<Map<String, Object>> rows = new ArrayList<>();
        int rowEnd = resolveDataEndRow(sheet, config, generatedTemplate);
        for (int rowIndex = config.dataStartRow; rowIndex <= rowEnd; rowIndex++) {
            Map<String, String> values = new LinkedHashMap<>();
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
                    colPointer++;
                }
            }
            if (isExamplePlaceholderRow(values) || isEmptyRow(values)) {
                continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rowId", config.sectionCode + "_" + (rowIndex + 1));
            row.put("values", values);
            row.put("templateRow", true);
            rows.add(row);
        }
        return rows;
    }

    private int resolveDataEndRow(Sheet sheet, SectionConfig config, boolean generatedTemplate) {
        if (!generatedTemplate) {
            return config.dataEndRow;
        }
        if (sheet == null) {
            return config.dataEndRow;
        }
        int sheetLastRow = Math.max(config.dataEndRow, sheet.getLastRowNum());
        for (int rowIndex = config.dataStartRow; rowIndex <= sheetLastRow; rowIndex++) {
            if (rowIndex <= config.dataStartRow) {
                continue;
            }
            if (isNextTemplateSectionTitleRow(sheet, config, rowIndex)) {
                return Math.max(config.dataStartRow, rowIndex - 1);
            }
        }
        return sheetLastRow;
    }

    private boolean isNextTemplateSectionTitleRow(Sheet sheet, SectionConfig currentConfig, int rowIndex) {
        String cellValue = normalizeValue(readMergedValue(sheet, rowIndex, currentConfig.titleCol));
        if (cellValue.isEmpty()) {
            return false;
        }
        return TEMPLATE_SECTION_CONFIGS.stream()
                .filter(config -> config != currentConfig)
                .filter(config -> config.sheetName.equals(currentConfig.sheetName))
                .anyMatch(config -> config.sectionLabel.equals(cellValue));
    }

    private boolean isEmptyRow(Map<String, String> values) {
        return values.values().stream().allMatch(this::isBlankCellValue);
    }

    private boolean isExamplePlaceholderRow(Map<String, String> values) {
        return values.values().stream()
                .filter(value -> !isBlankCellValue(value))
                .allMatch(this::isPlaceholderCellValue);
    }

    private boolean isBlankCellValue(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean isPlaceholderCellValue(String value) {
        if (value == null) {
            return false;
        }
        String normalized = value.trim();
        return "…".equals(normalized) || "...".equals(normalized) || "…. ".equals(normalized) || "….".equals(normalized);
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

    private List<Map<String, String>> parseSectionMetadata(Sheet sheet, SectionConfig config) {
        List<Map<String, String>> items = new ArrayList<>();
        for (SectionMetaConfig metaConfig : config.metadataConfigs) {
            String label = normalizeValue(readMergedValue(sheet, metaConfig.labelRow, metaConfig.labelCol));
            String value = normalizeValue(readMergedValue(sheet, metaConfig.valueRow, metaConfig.valueCol));
            if (label.isBlank() && value.isBlank()) {
                continue;
            }
            Map<String, String> item = new LinkedHashMap<>();
            item.put("key", metaConfig.key);
            item.put("label", metaConfig.label.isBlank() ? label : metaConfig.label);
            item.put("value", value);
            items.add(item);
        }
        return items;
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

    private Map<String, String> column(String key, String label, List<String> headerPath) {
        Map<String, String> column = new LinkedHashMap<>();
        column.put("key", key);
        column.put("label", label);
        if (headerPath != null && !headerPath.isEmpty()) {
            column.put("headerPath", writeJson(headerPath));
        }
        return column;
    }

    private static FixedColumnConfig fixedColumn(String key, String label, String columnLetter) {
        return new FixedColumnConfig(key, label, excelColumnIndex(columnLetter), List.of(label));
    }

    private static FixedColumnConfig fixedColumn(String key, String label, String columnLetter, String... headerPath) {
        List<String> resolvedHeaderPath = headerPath == null || headerPath.length == 0
                ? List.of(label)
                : List.of(headerPath);
        return new FixedColumnConfig(key, label, excelColumnIndex(columnLetter), resolvedHeaderPath);
    }

    public byte[] buildBlankTemplateBytes() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            buildBlankTemplateWorkbook(workbook);
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("빈 설문 양식 생성에 실패했습니다.", e);
        }
    }

    private void buildBlankTemplateWorkbook(Workbook workbook) {
        writeTemplateMarker(workbook);
        populateTemplateSheet(workbook, "투입물 데이터 수집", "3. 투입물 데이터 수집");
        populateTemplateSheet(workbook, "산출물 데이터 수집", "4. 산출물 데이터 수집");
    }

    private void writeTemplateMarker(Workbook workbook) {
        if (workbook instanceof XSSFWorkbook) {
            XSSFWorkbook xssfWorkbook = (XSSFWorkbook) workbook;
            xssfWorkbook.getProperties().getCustomProperties().addProperty(TEMPLATE_MARKER_PROPERTY, TEMPLATE_MARKER_VALUE);
        }
    }

    private void populateTemplateSheet(Workbook workbook, String sheetName, String majorTitle) {
        Sheet sheet = workbook.createSheet(sheetName);
        setCellValue(sheet, 0, 1, majorTitle, resolveTemplateTitleStyle(workbook));
        sheet.createFreezePane(1, 1);
        sheet.setColumnWidth(0, 3 * 256);
        Row titleRow = sheet.getRow(0);
        if (titleRow != null) {
            titleRow.setHeightInPoints(28f);
        }
        TEMPLATE_SECTION_CONFIGS.stream()
                .filter(config -> config.sheetName.equals(sheetName))
                .forEach(config -> writeTemplateSection(sheet, config));
    }

    private void writeTemplateSection(Sheet sheet, SectionConfig config) {
        setCellValue(sheet, config.titleRow, config.titleCol, config.sectionLabel, resolveTemplateSectionStyle(sheet.getWorkbook()));
        Row sectionRow = sheet.getRow(config.titleRow);
        if (sectionRow != null) {
            sectionRow.setHeightInPoints(24f);
        }
        for (SectionMetaConfig metadataConfig : config.metadataConfigs) {
            setCellValue(sheet, metadataConfig.labelRow, metadataConfig.labelCol, metadataConfig.label, resolveTemplateMetaLabelStyle(sheet.getWorkbook()));
        }
        if (config.fixedColumns == null || config.fixedColumns.isEmpty()) {
            return;
        }
        int headerDepth = Math.max(config.fixedColumns.stream().mapToInt(column -> column.headerPath.size()).max().orElse(1), 1);
        for (FixedColumnConfig column : config.fixedColumns) {
            for (int level = 0; level < headerDepth; level++) {
                String label = level < column.headerPath.size() ? column.headerPath.get(level) : "";
                if (!label.isBlank()) {
                    setCellValue(sheet, config.headerStartRow + level, column.colIndex, label, resolveTemplateHeaderStyle(sheet.getWorkbook()));
                }
            }
            sheet.setColumnWidth(column.colIndex, resolveTemplateColumnWidth(column));
        }
        for (int rowIndex = config.headerStartRow; rowIndex <= config.headerEndRow; rowIndex++) {
            Row headerRow = sheet.getRow(rowIndex);
            if (headerRow != null) {
                headerRow.setHeightInPoints(34f);
            }
        }
        for (int rowIndex = config.dataStartRow; rowIndex <= config.dataEndRow; rowIndex++) {
            Row dataRow = sheet.getRow(rowIndex);
            if (dataRow == null) {
                dataRow = sheet.createRow(rowIndex);
            }
            dataRow.setHeightInPoints(24f);
            for (FixedColumnConfig column : config.fixedColumns) {
                setCellValue(sheet, rowIndex, column.colIndex, "", resolveTemplateCellStyle(sheet.getWorkbook()));
            }
        }
        mergeTemplateHeaders(sheet, config, headerDepth);
    }

    private void mergeTemplateHeaders(Sheet sheet, SectionConfig config, int headerDepth) {
        for (int level = 0; level < headerDepth; level++) {
            int index = 0;
            while (index < config.fixedColumns.size()) {
                FixedColumnConfig column = config.fixedColumns.get(index);
                if (level >= column.headerPath.size()) {
                    index += 1;
                    continue;
                }
                String label = column.headerPath.get(level);
                String prefix = String.join("\u0000", column.headerPath.subList(0, level));
                int lastIndex = index;
                while (lastIndex + 1 < config.fixedColumns.size()) {
                    FixedColumnConfig candidate = config.fixedColumns.get(lastIndex + 1);
                    if (level >= candidate.headerPath.size()) {
                        break;
                    }
                    if (!label.equals(candidate.headerPath.get(level))) {
                        break;
                    }
                    if (!prefix.equals(String.join("\u0000", candidate.headerPath.subList(0, level)))) {
                        break;
                    }
                    lastIndex += 1;
                }
                int firstCol = config.fixedColumns.get(index).colIndex;
                int lastCol = config.fixedColumns.get(lastIndex).colIndex;
                int row = config.headerStartRow + level;
                if (firstCol < lastCol) {
                    CellRangeAddress region = new CellRangeAddress(row, row, firstCol, lastCol);
                    sheet.addMergedRegion(region);
                    applyTemplateBorder(region, sheet);
                } else if (level == column.headerPath.size() - 1 && level < headerDepth - 1) {
                    CellRangeAddress region = new CellRangeAddress(row, config.headerStartRow + headerDepth - 1, firstCol, firstCol);
                    sheet.addMergedRegion(region);
                    applyTemplateBorder(region, sheet);
                }
                index = lastIndex + 1;
            }
        }
    }

    private void applyTemplateBorder(CellRangeAddress region, Sheet sheet) {
        RegionUtil.setBorderTop(BorderStyle.THIN, region, sheet);
        RegionUtil.setBorderRight(BorderStyle.THIN, region, sheet);
        RegionUtil.setBorderBottom(BorderStyle.THIN, region, sheet);
        RegionUtil.setBorderLeft(BorderStyle.THIN, region, sheet);
        RegionUtil.setTopBorderColor(IndexedColors.GREY_40_PERCENT.getIndex(), region, sheet);
        RegionUtil.setRightBorderColor(IndexedColors.GREY_40_PERCENT.getIndex(), region, sheet);
        RegionUtil.setBottomBorderColor(IndexedColors.GREY_40_PERCENT.getIndex(), region, sheet);
        RegionUtil.setLeftBorderColor(IndexedColors.GREY_40_PERCENT.getIndex(), region, sheet);
    }

    private void setCellValue(Sheet sheet, int rowIndex, int colIndex, String value) {
        setCellValue(sheet, rowIndex, colIndex, value, resolveTemplateCellStyle(sheet.getWorkbook()));
    }

    private void setCellValue(Sheet sheet, int rowIndex, int colIndex, String value, CellStyle style) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            row = sheet.createRow(rowIndex);
        }
        Cell cell = row.getCell(colIndex);
        if (cell == null) {
            cell = row.createCell(colIndex);
        }
        cell.setCellValue(value == null ? "" : value);
        if (style != null) {
            cell.setCellStyle(style);
        }
    }

    private CellStyle resolveTemplateCellStyle(Workbook workbook) {
        if (templateCellStyle != null) {
            return templateCellStyle;
        }
        CellStyle style = workbook.createCellStyle();
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setWrapText(true);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        style.setRightBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        style.setBottomBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        style.setLeftBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        templateCellStyle = style;
        return style;
    }

    private CellStyle resolveTemplateTitleStyle(Workbook workbook) {
        if (templateTitleStyle != null) {
            return templateTitleStyle;
        }
        CellStyle style = workbook.createCellStyle();
        style.cloneStyleFrom(resolveTemplateCellStyle(workbook));
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        templateTitleStyle = style;
        return style;
    }

    private CellStyle resolveTemplateSectionStyle(Workbook workbook) {
        if (templateSectionStyle != null) {
            return templateSectionStyle;
        }
        CellStyle style = workbook.createCellStyle();
        style.cloneStyleFrom(resolveTemplateCellStyle(workbook));
        style.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        templateSectionStyle = style;
        return style;
    }

    private CellStyle resolveTemplateHeaderStyle(Workbook workbook) {
        if (templateHeaderStyle != null) {
            return templateHeaderStyle;
        }
        CellStyle style = workbook.createCellStyle();
        style.cloneStyleFrom(resolveTemplateCellStyle(workbook));
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        templateHeaderStyle = style;
        return style;
    }

    private CellStyle resolveTemplateMetaLabelStyle(Workbook workbook) {
        if (templateMetaLabelStyle != null) {
            return templateMetaLabelStyle;
        }
        CellStyle style = workbook.createCellStyle();
        style.cloneStyleFrom(resolveTemplateCellStyle(workbook));
        style.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        templateMetaLabelStyle = style;
        return style;
    }

    private int resolveTemplateColumnWidth(FixedColumnConfig column) {
        String key = column.key;
        if ("group".equals(key)) {
            return 25 * 256;
        }
        if ("materialName".equals(key)) {
            return 28 * 256;
        }
        if ("origin".equals(key) || "transportRoute".equals(key) || "treatmentMethod".equals(key)) {
            return 18 * 256;
        }
        if ("marineTransport".equals(key) || "roadTransport".equals(key)) {
            return 10 * 256;
        }
        if ("marineTonKm".equals(key) || "roadTonKm".equals(key) || "transportTonKm".equals(key)) {
            return 14 * 256;
        }
        if ("remark".equals(key)) {
            return 16 * 256;
        }
        return Math.max(12, column.label.replace("\n", "").length() + 4) * 256;
    }

    private void clearCellValue(Sheet sheet, int rowIndex, int colIndex) {
        if (sheet == null) {
            return;
        }
        for (CellRangeAddress region : sheet.getMergedRegions()) {
            if (!region.isInRange(rowIndex, colIndex)) {
                continue;
            }
            Row mergedRow = sheet.getRow(region.getFirstRow());
            if (mergedRow == null) {
                return;
            }
            Cell mergedCell = mergedRow.getCell(region.getFirstColumn());
            if (mergedCell == null) {
                return;
            }
            mergedCell.setBlank();
            return;
        }
        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            return;
        }
        Cell cell = row.getCell(colIndex);
        if (cell == null) {
            return;
        }
        cell.setBlank();
    }

    private static int excelColumnIndex(String columnLetter) {
        String normalized = columnLetter == null ? "" : columnLetter.trim().toUpperCase(Locale.ROOT);
        int result = 0;
        for (int index = 0; index < normalized.length(); index++) {
            result = (result * 26) + (normalized.charAt(index) - 'A' + 1);
        }
        return Math.max(result - 1, 0);
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

    private List<SectionConfig> resolveSectionConfigs(Workbook workbook) {
        return isGeneratedTemplate(workbook) ? TEMPLATE_SECTION_CONFIGS : SECTION_CONFIGS;
    }

    private boolean isGeneratedTemplate(Workbook workbook) {
        if (!(workbook instanceof XSSFWorkbook)) {
            return false;
        }
        XSSFWorkbook xssfWorkbook = (XSSFWorkbook) workbook;
        try {
            String marker = xssfWorkbook.getProperties().getCustomProperties().getProperty(TEMPLATE_MARKER_PROPERTY).getLpwstr();
            return TEMPLATE_MARKER_VALUE.equals(marker);
        } catch (Exception ignored) {
            return false;
        }
    }

    private static List<FixedColumnConfig> templateFixedColumns(String sectionCode, String startColumnLetter) {
        List<FixedColumnConfig> sourceColumns = FIXED_SECTION_COLUMNS.get(sectionCode);
        if (sourceColumns == null || sourceColumns.isEmpty()) {
            return List.of();
        }
        int startColIndex = excelColumnIndex(startColumnLetter);
        List<FixedColumnConfig> columns = new ArrayList<>();
        for (int index = 0; index < sourceColumns.size(); index++) {
            FixedColumnConfig source = sourceColumns.get(index);
            columns.add(new FixedColumnConfig(source.key, source.label, startColIndex + index, source.headerPath));
        }
        return columns;
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
        return readRegistry(DRAFT_REGISTRY_PATH, "Failed to read emission survey draft registry");
    }

    private void writeDraftRegistry(Map<String, Map<String, Object>> registry) {
        writeRegistry(DRAFT_REGISTRY_PATH, registry);
    }

    private Map<String, Map<String, Object>> readSetRegistry() {
        return readRegistry(SET_REGISTRY_PATH, "Failed to read emission survey draft set registry");
    }

    private Map<String, Map<String, Object>> readRegistry(Path path, String errorMessage) {
        if (!Files.exists(path)) {
            return new LinkedHashMap<>();
        }
        try (InputStream inputStream = Files.newInputStream(path)) {
            Map<String, Map<String, Object>> value = objectMapper.readValue(
                    inputStream,
                    new TypeReference<LinkedHashMap<String, Map<String, Object>>>() {}
            );
            return value == null ? new LinkedHashMap<>() : value;
        } catch (Exception e) {
            throw new IllegalStateException(errorMessage, e);
        }
    }

    private void writeRegistry(Path path, Map<String, Map<String, Object>> registry) {
        try {
            Files.createDirectories(path.getParent());
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(path.toFile(), registry);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to write emission survey registry", e);
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

    private void deleteCaseDraftFromDatabase(String sectionCode, String caseCode) {
        try {
            String caseId = buildCaseId(sectionCode, caseCode);
            adminEmissionSurveyDraftMapper.deleteCaseRows(caseId);
            adminEmissionSurveyDraftMapper.deleteCaseHeader(caseId);
        } catch (Exception ignored) {
            // Keep file-based deletion result even when DB cleanup fails.
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
        private final int guidanceMarkerCol;
        private final int guidanceTextCol;
        private final int titleRow;
        private final int titleCol;
        private final int startCol;
        private final int endCol;
        private final int headerStartRow;
        private final int headerEndRow;
        private final int dataStartRow;
        private final int dataEndRow;
        private final List<SectionMetaConfig> metadataConfigs;
        private final List<FixedColumnConfig> fixedColumns;

        private SectionConfig(String sheetName,
                              String majorCode,
                              String majorLabel,
                              String sectionCode,
                              String sectionLabel,
                              int guidanceStartRow,
                              int guidanceEndRow,
                              int guidanceMarkerCol,
                              int guidanceTextCol,
                              int titleRow,
                              int titleCol,
                              int startCol,
                              int endCol,
                              int headerStartRow,
                              int headerEndRow,
                              int dataStartRow,
                              int dataEndRow,
                              List<SectionMetaConfig> metadataConfigs,
                              List<FixedColumnConfig> fixedColumns) {
            this.sheetName = sheetName;
            this.majorCode = majorCode;
            this.majorLabel = majorLabel;
            this.sectionCode = sectionCode;
            this.sectionLabel = sectionLabel;
            this.guidanceStartRow = guidanceStartRow;
            this.guidanceEndRow = guidanceEndRow;
            this.guidanceMarkerCol = guidanceMarkerCol;
            this.guidanceTextCol = guidanceTextCol;
            this.titleRow = titleRow;
            this.titleCol = titleCol;
            this.startCol = startCol;
            this.endCol = endCol;
            this.headerStartRow = headerStartRow;
            this.headerEndRow = headerEndRow;
            this.dataStartRow = dataStartRow;
            this.dataEndRow = dataEndRow;
            this.metadataConfigs = metadataConfigs == null ? List.of() : metadataConfigs;
            this.fixedColumns = fixedColumns == null ? List.of() : fixedColumns;
        }
    }

    private static final class SectionMetaConfig {
        private final String key;
        private final String label;
        private final int labelRow;
        private final int labelCol;
        private final int valueRow;
        private final int valueCol;

        private SectionMetaConfig(String key,
                                  String label,
                                  int labelRow,
                                  int labelCol,
                                  int valueRow,
                                  int valueCol) {
            this.key = key;
            this.label = label;
            this.labelRow = labelRow;
            this.labelCol = labelCol;
            this.valueRow = valueRow;
            this.valueCol = valueCol;
        }
    }

    private static final class FixedColumnConfig {
        private final String key;
        private final String label;
        private final int colIndex;
        private final List<String> headerPath;

        private FixedColumnConfig(String key, String label, int colIndex, List<String> headerPath) {
            this.key = key;
            this.label = label;
            this.colIndex = colIndex;
            this.headerPath = headerPath == null || headerPath.isEmpty() ? List.of(label) : headerPath;
        }
    }
}
