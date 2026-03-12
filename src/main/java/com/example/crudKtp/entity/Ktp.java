package com.example.crudKtp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Ktp")
public class Ktp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nomorKtp", unique = true, nullable = false)
    private String nomorKtp;

    @Column(name = "namaLengkap", nullable = false)
    private String namaLengkap;

    @Column(name = "alamat", nullable = false)
    private String alamat;

    @Column(name = "tanggalLahir", nullable = false)
    private LocalDate tanggalLahir;

    @Column(name = "jenisKelamin", nullable = false)
    private String jenisKelamin;

}
