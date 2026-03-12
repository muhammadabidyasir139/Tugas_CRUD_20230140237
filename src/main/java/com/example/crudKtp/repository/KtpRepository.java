package com.example.crudKtp.repository;

import com.example.crudKtp.entity.Ktp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KtpRepository extends JpaRepository<Ktp, Integer> {
    
    boolean existsByNomorKtp(String nomorKtp);
    
    Optional<Ktp> findByNomorKtp(String nomorKtp);
}
