package com.example.crudKtp.service;

import com.example.crudKtp.entity.Ktp;
import com.example.crudKtp.repository.KtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KtpService {

    private final KtpRepository ktpRepository;

    @Transactional(readOnly = true)
    public List<Ktp> getAllKtp() {
        return ktpRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Ktp getKtpById(Integer id) {
        return ktpRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Data KTP tidak ditemukan dengan id: " + id));
    }

    @Transactional
    public Ktp createKtp(Ktp ktp) {
        if (ktpRepository.existsByNomorKtp(ktp.getNomorKtp())) {
            throw new IllegalArgumentException("Nomor KTP sudah terdaftar!");
        }
        return ktpRepository.save(ktp);
    }

    @Transactional
    public Ktp updateKtp(Integer id, Ktp updatedKtp) {
        Ktp existingKtp = getKtpById(id);
        
        // Cek apakah nomor KTP diubah dan apakah nomor baru sudah ada
        if (!existingKtp.getNomorKtp().equals(updatedKtp.getNomorKtp()) 
                && ktpRepository.existsByNomorKtp(updatedKtp.getNomorKtp())) {
            throw new IllegalArgumentException("Nomor KTP sudah terdaftar pada data lain!");
        }

        existingKtp.setNomorKtp(updatedKtp.getNomorKtp());
        existingKtp.setNamaLengkap(updatedKtp.getNamaLengkap());
        existingKtp.setAlamat(updatedKtp.getAlamat());
        existingKtp.setTanggalLahir(updatedKtp.getTanggalLahir());
        existingKtp.setJenisKelamin(updatedKtp.getJenisKelamin());

        return ktpRepository.save(existingKtp);
    }

    @Transactional
    public void deleteKtp(Integer id) {
        Ktp ktp = getKtpById(id);
        ktpRepository.delete(ktp);
    }
}
