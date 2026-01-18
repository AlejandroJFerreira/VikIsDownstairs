package org.example.passwordapi;

import org.springframework.web.bind.annotation.*;
import java.net.URL;
import java.net.HttpURLConnection;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.util.Map;

@RestController
@RequestMapping("/api/passwords")
public class PasswordController {

    private final int SHIFT = 3;

    @PostMapping
    public String savePassword(@RequestBody Map<String, Object> passwordData) {
        String username = (String) passwordData.get("username");
        String password = (String) passwordData.get("password");
        String service = (String) passwordData.get("service");
        if (password != null && username != null && service != null) {
            String encryptedPassword = EncryptionUtil.caesarEncrypt(password, SHIFT);
            System.out.println("Encrypted password: " + encryptedPassword);

            // Prepare JSON for Pi receiver
            String json = "{"
                    + "\"username\":\"" + username + "\","
                    + "\"service\":\"" + service + "\","
                    + "\"ciphertext\":\"" + encryptedPassword + "\","
                    + "\"iv\":\"dummyiv\","
                    + "\"salt\":\"dummysalt\""
                    + "}";

            // Send POST to Pi receiver
            try {
                URL url = new URL("http://10.224.149.15:5000/store");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(json.getBytes());
                }

                int responseCode = conn.getResponseCode();
                System.out.println("Pi receiver response code: " + responseCode);
            } catch (Exception e) {
                e.printStackTrace();
                return "Error forwarding to Pi receiver!";
            }

            return "Password received, encrypted, and forwarded!";
        }
        return "No password provided or service missing!";
    }
}