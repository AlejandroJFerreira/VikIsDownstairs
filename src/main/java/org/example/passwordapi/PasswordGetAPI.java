package org.example.passwordapi;

import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wordpass")
@CrossOrigin(origins = "*")
public class PasswordGetAPI {

    private static final String PI_BASE_URL = "http://10.224.149.15:5000";
    private static final int SHIFT = 3;

    /**
     * STORE PASSWORD
     * Client → Java → Raspberry Pi
     */
    @PostMapping("/store")
    public String storePassword(@RequestBody Map<String, Object> passwordData) {

        String service = (String) passwordData.get("service");
        String password = (String) passwordData.get("password");

        if (service == null || password == null) {
            return "Missing service or password";
        }

        String encryptedPassword = EncryptionUtil.caesarEncrypt(password, SHIFT);

        String json = "{"
                + "\"service\":\"" + service.toLowerCase() + "\","
                + "\"ciphertext\":\"" + encryptedPassword + "\","
                + "\"iv\":\"dummyiv\","
                + "\"salt\":\"dummysalt\""
                + "}";

        try {
            URL url = new URL(PI_BASE_URL + "/store");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(json.getBytes(StandardCharsets.UTF_8));
            }

            return "Password encrypted and stored";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error storing password";
        }
    }

    /**
     * RETRIEVE PASSWORD
     * Client → Java → Raspberry Pi
     */
    @GetMapping("/retrieve")
    public String retrievePassword(@RequestParam String service) {

        try {
            String query = PI_BASE_URL + "/retrieve?service="
                    + URLEncoder.encode(service.toLowerCase(), StandardCharsets.UTF_8);

            URL url = new URL(query);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            InputStream is = conn.getResponseCode() < 400
                    ? conn.getInputStream()
                    : conn.getErrorStream();

            try (BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
                return br.lines().collect(Collectors.joining());
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "Error retrieving password";
        }
    }
}
