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
    void repairAndVerificationMappersPreserveOccurredAtFromServicePayload() throws Exception {
        String xml = Files.readString(XML_PATH, StandardCharsets.UTF_8);

        Pattern occurredAtBinding = Pattern.compile("#\\{occurredAt}\\s*,\\s*0\\s*,\\s*#\\{createdBy}");
        Matcher matcher = occurredAtBinding.matcher(xml);
        int count = 0;
        while (matcher.find()) {
            count++;
        }

        assertEquals(3, count,
                "repair session/apply and verification inserts must bind occurredAt instead of replacing it with CURRENT_DATETIME");

        Pattern hardCodedOccurredAt = Pattern.compile("CURRENT_DATETIME\\s*,\\s*0\\s*,\\s*#\\{createdBy}");
        assertTrue(!hardCodedOccurredAt.matcher(xml).find(),
                "repair/verification OCCURRED_AT columns must not be hard-coded to CURRENT_DATETIME");
    }
}
