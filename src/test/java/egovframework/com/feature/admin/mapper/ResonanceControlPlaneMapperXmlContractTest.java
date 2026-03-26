package egovframework.com.feature.admin.mapper;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ResonanceControlPlaneMapperXmlContractTest {

    private static final Path XML_PATH = Path.of(
            "src/main/resources/egovframework/mapper/com/feature/admin/ResonanceControlPlaneMapper.xml");

    @Test
    void controlPlaneInsertMappersPreserveOccurredAtFromServicePayload() throws Exception {
        String xml = Files.readString(XML_PATH, StandardCharsets.UTF_8);

        Pattern occurredAtBinding = Pattern.compile("#\\{occurredAt}\\s*,\\s*0\\s*,\\s*#\\{createdBy}");
        Matcher matcher = occurredAtBinding.matcher(xml);
        int count = 0;
        while (matcher.find()) {
            count++;
        }

        assertEquals(4, count,
                "parity compare, repair session/apply, and verification inserts must bind occurredAt in the standard slot; module binding result is verified separately because it keeps RESULT_PAYLOAD_JSON after OCCURRED_AT");

        Pattern hardCodedOccurredAt = Pattern.compile("CURRENT_DATETIME\\s*,\\s*0\\s*,\\s*#\\{createdBy}");
        assertTrue(!hardCodedOccurredAt.matcher(xml).find(),
                "control-plane OCCURRED_AT columns must not be hard-coded to CURRENT_DATETIME");
    }

    @Test
    void moduleBindingResultMapperPersistsOccurredAtFromServicePayload() throws Exception {
        String xml = Files.readString(XML_PATH, StandardCharsets.UTF_8);

        Pattern moduleBindingResultInsert = Pattern.compile(
                "RSN_MODULE_BINDING_RESULT\\s*\\(.*?ROLLBACK_ANCHOR_YN,\\s*OCCURRED_AT,\\s*RESULT_PAYLOAD_JSON.*?"
                        + "#\\{nextRecommendedAction},\\s*#\\{rollbackAnchorYn},\\s*#\\{occurredAt},\\s*#\\{resultPayloadJson}",
                Pattern.DOTALL);

        assertTrue(moduleBindingResultInsert.matcher(xml).find(),
                "module binding result insert must bind OCCURRED_AT before RESULT_PAYLOAD_JSON");
    }

    @Test
    void moduleBindingResultLookupAvoidsSelectingMissingOwnerLaneColumnAndUsesPreviewLookup() throws Exception {
        String xml = Files.readString(XML_PATH, StandardCharsets.UTF_8);

        Pattern resultSelectOwnerLane = Pattern.compile(
                "<select id=\"selectModuleBindingResultByPreviewId\".*?OWNER_LANE AS ownerLane",
                Pattern.DOTALL);
        assertTrue(!resultSelectOwnerLane.matcher(xml).find(),
                "module binding result lookup must not project OWNER_LANE from RSN_MODULE_BINDING_RESULT");

        Pattern previewLookup = Pattern.compile(
                "<select id=\"selectModuleBindingPreviewById\".*?PREVIEW_PAYLOAD_JSON AS previewPayloadJson",
                Pattern.DOTALL);
        assertTrue(previewLookup.matcher(xml).find(),
                "module binding preview lookup must expose PREVIEW_PAYLOAD_JSON for ownerLane recovery");
    }
}
