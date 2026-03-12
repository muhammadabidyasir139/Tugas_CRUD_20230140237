package com.example.crudKtp.controller;

import com.example.crudKtp.entity.Ktp;
import com.example.crudKtp.service.KtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ktp")
@RequiredArgsConstructor
public class KtpController {

    private final KtpService ktpService;

    @GetMapping
    public ResponseEntity<List<Ktp>> getAllKtp() {
        return ResponseEntity.ok(ktpService.getAllKtp());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ktp> getKtpById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ktpService.getKtpById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createKtp(@RequestBody Ktp ktp) {
        Map<String, Object> response = new HashMap<>();
        try {
            Ktp savedKtp = ktpService.createKtp(ktp);
            response.put("message", "Data KTP berhasil ditambahkan");
            response.put("data", savedKtp);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("error", "Terjadi kesalahan pada server");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateKtp(@PathVariable Integer id, @RequestBody Ktp ktp) {
        Map<String, Object> response = new HashMap<>();
        try {
            Ktp updatedKtp = ktpService.updateKtp(id, ktp);
            response.put("message", "Data KTP berhasil diperbarui");
            response.put("data", updatedKtp);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            if(e.getMessage().contains("tidak ditemukan")) {
                response.put("error", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("error", "Terjadi kesalahan pada server");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteKtp(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            ktpService.deleteKtp(id);
            response.put("message", "Data KTP berhasil dihapus");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
             response.put("error", e.getMessage());
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("error", "Terjadi kesalahan pada server");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
