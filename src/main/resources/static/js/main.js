$(document).ready(function () {
    const API_URL = '/ktp';
    let isEditing = false;
    let currentId = null;

    // Inisialisasi: Muat data pertama kali
    loadData();

    // Event Listener untuk Form Submit
    $('#ktp-form').on('submit', function (e) {
        e.preventDefault();

        // Validasi form HTML5 akan berjalan, kode ini hanya eksekusi jika valid
        const formData = {
            nomorKtp: $('#nomorKtp').val().trim(),
            namaLengkap: $('#namaLengkap').val().trim(),
            alamat: $('#alamat').val().trim(),
            tanggalLahir: $('#tanggalLahir').val(),
            jenisKelamin: $('#jenisKelamin').val()
        };

        if (isEditing) {
            updateData(currentId, formData);
        } else {
            createData(formData);
        }
    });

    // Event Listener untuk membatalkan Edit
    $('#btn-cancel').on('click', function () {
        resetForm();
    });

    // Delegasi Event untuk Tombol Edit di dalam Tabel
    $('#ktp-tbody').on('click', '.btn-edit', function () {
        const id = $(this).data('id');
        fetchDetailAndEdit(id);
    });

    // Delegasi Event untuk Tombol Hapus (Menampilkan Modal)
    $('#ktp-tbody').on('click', '.btn-delete', function () {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#delete-ktp-id').val(id);
        $('#delete-name-preview').text(name);
        
        // Tampilkan Modal
        $('#delete-modal').addClass('show');
    });

    // Menyembunyikan Modal (Close Button atau Background)
    $('.close-modal, .close-modal-btn').on('click', function () {
        $('#delete-modal').removeClass('show');
    });

    // Konfirmasi Hapus Data dari Modal
    $('#btn-confirm-delete').on('click', function () {
        const id = $('#delete-ktp-id').val();
        deleteData(id);
        $('#delete-modal').removeClass('show'); // Tutup modal setelah konfirmasi
    });

    // Event Listener untuk Pencarian (Search Input)
    $('#search-input').on('keyup', function () {
        const value = $(this).val().toLowerCase();
        $("#ktp-tbody tr").filter(function () {
            // Abaikan baris loading jika ada
            if($(this).attr('id') === 'loading-row') return false;
            if($(this).find('.empty-state').length > 0) return false;
            
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
        
        updateDataCount();
    });

    // ==========================================
    // FUNGSI AJAX CRUD
    // ==========================================

    // 1. CREATE DATA (POST)
    function createData(data) {
        setLoadingState(true, '#btn-submit');
        
        $.ajax({
            url: API_URL,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                showAlert('success', 'Sukses', response.message);
                resetForm();
                loadData(); // Muat ulang tabel
            },
            error: function (xhr) {
                let errorMessage = "Gagal menambahkan data. Silakan coba lagi.";
                if (xhr.status === 400 && xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                showAlert('error', 'Gagal', errorMessage);
            },
            complete: function() {
                setLoadingState(false, '#btn-submit', '<i class="fa-solid fa-save"></i> Simpan Data');
            }
        });
    }

    // 2. READ DATA / MUAT SELURUH DATA (GET)
    function loadData() {
        showTableLoading();
        
        $.ajax({
            url: API_URL,
            type: 'GET',
            success: function (data) {
                renderTable(data);
            },
            error: function () {
                showAlert('error', 'Koneksi Bermasalah', 'Gagal memuat data dari server.');
                renderEmptyTable("Terjadi kesalahan teknis saat mengambil data.");
            }
        });
    }

    // 3. READ DETAIL DATA UNTUK EDIT (GET {id})
    function fetchDetailAndEdit(id) {
        $.ajax({
            url: `${API_URL}/${id}`,
            type: 'GET',
            success: function (data) {
                // Populate Form
                $('#ktp-id').val(data.id);
                $('#nomorKtp').val(data.nomorKtp);
                $('#namaLengkap').val(data.namaLengkap);
                $('#alamat').val(data.alamat);
                $('#tanggalLahir').val(data.tanggalLahir);
                $('#jenisKelamin').val(data.jenisKelamin);

                // Ubah Tampilan Form ke Mode Edit
                isEditing = true;
                currentId = data.id;
                
                $('#form-title').html('<i class="fa-solid fa-pen-to-square"></i> Perbarui Data KTP');
                $('#btn-submit').html('<i class="fa-solid fa-rotate"></i> Perbarui Data');
                $('#btn-cancel').show();

                // Scroll ke form
                $('html, body').animate({
                    scrollTop: $(".form-section").offset().top - 20
                }, 500);
            },
            error: function () {
                showAlert('error', 'Akses Ditolak', 'Data tidak ditemukan atau sudah dihapus.');
                loadData(); // Refesh list siapa tau data udh ga ada
            }
        });
    }

    // 4. UPDATE DATA (PUT)
    function updateData(id, data) {
         setLoadingState(true, '#btn-submit');
         
        $.ajax({
            url: `${API_URL}/${id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                showAlert('success', 'Berhasil', response.message);
                resetForm();
                loadData();
            },
            error: function (xhr) {
                let errorMessage = "Gagal memperbarui data. Silakan coba lagi.";
                if (xhr.status === 400 && xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                } else if(xhr.status === 404) {
                    errorMessage = "Data KTP ini sudah tidak ditemukan di database.";
                }
                showAlert('error', 'Pembaruan Gagal', errorMessage);
            },
            complete: function() {
                setLoadingState(false, '#btn-submit', '<i class="fa-solid fa-rotate"></i> Perbarui Data');
                if(!isEditing) { // Jika gagal update dan tetap di mode edit, jgn override text btn jadi Simpan
                     $('#btn-submit').html('<i class="fa-solid fa-save"></i> Simpan Data');
                }
            }
        });
    }

    // 5. DELETE DATA (DELETE)
    function deleteData(id) {
        $.ajax({
            url: `${API_URL}/${id}`,
            type: 'DELETE',
            success: function (response) {
                showAlert('success', 'Dihapus', response.message);
                loadData();
                
                // Jika sedang ngedit data yang barusan dihapus, reset form
                if (isEditing && currentId == id) {
                    resetForm();
                }
            },
            error: function () {
                showAlert('error', 'Gagal Menghapus', 'Data mungkin sudah terhapus atau hubungi administrator.');
            }
        });
    }

    // ==========================================
    // FUNGSI UTILITAS KERJA (UI & HELPER)
    // ==========================================

    function resetForm() {
        $('#ktp-form')[0].reset();
        $('#ktp-id').val('');
        isEditing = false;
        currentId = null;
        
        $('#form-title').html('<i class="fa-solid fa-user-plus"></i> Tambah Data KTP Baru');
        $('#btn-submit').html('<i class="fa-solid fa-save"></i> Simpan Data');
        $('#btn-cancel').hide();
    }

    function renderTable(dataArray) {
        const tbody = $('#ktp-tbody');
        tbody.empty();

        if (dataArray.length === 0) {
            renderEmptyTable("Belum ada data penduduk yang terdaftar.");
            updateDataCount();
            return;
        }

        dataArray.forEach((item, index) => {
            // Format Tanggal (YYYY-MM-DD -> DD/MM/YYYY)
            const dateParts = item.tanggalLahir.split('-');
            const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            
            // Format Jenis Kelamin menjadi Label Pendek L / P
            let labelGender = item.jenisKelamin === 'Laki-laki' ? 'L' : 'P';

            const rowStr = `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${item.nomorKtp}</strong></td>
                    <td>${item.namaLengkap}</td>
                    <td><span title="${item.jenisKelamin}">${labelGender}</span></td>
                    <td>${formattedDate}</td>
                    <td class="action-cell">
                        <button type="button" class="btn btn-action btn-edit" title="Edit Data" data-id="${item.id}">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" class="btn btn-action btn-delete" title="Hapus Data" data-id="${item.id}" data-name="${item.namaLengkap}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(rowStr);
        });
        
        updateDataCount();
    }

    function renderEmptyTable(message) {
        const tbody = $('#ktp-tbody');
        tbody.html(`
            <tr>
                <td colspan="6" class="text-center empty-state">
                    <i class="fa-solid fa-folder-open fa-3x" style="color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <p>${message}</p>
                </td>
            </tr>
        `);
    }

    function showTableLoading() {
        const tbody = $('#ktp-tbody');
        tbody.html(`
            <tr id="loading-row">
                <td colspan="6" class="text-center loading-state">
                    <i class="fa-solid fa-circle-notch fa-spin fa-2x" style="color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                    <p>Memuat data dari server...</p>
                </td>
            </tr>
        `);
    }

    function updateDataCount() {
        const visibleRows = $("#ktp-tbody tr:visible").length;
        // Count ignore loading/empty states
        const hasSpecialStates = $("#ktp-tbody tr#loading-row").length > 0 || $("#ktp-tbody .empty-state").length > 0;
        
        const count = hasSpecialStates ? 0 : visibleRows;
        $('#data-count-info').text(`Menampilkan ${count} data`);
    }

    function setLoadingState(isLoading, buttonId, originalHtml = '') {
        const btn = $(buttonId);
        if (isLoading) {
            btn.prop('disabled', true);
            btn.html('<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses...');
        } else {
            btn.prop('disabled', false);
            btn.html(originalHtml);
        }
    }

    function showAlert(type, title, message) {
        const $container = $('#alert-container');
        
        // Define alert template
        let alertClass = type === 'success' ? 'alert-success' : 'alert-error';
        let iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
        
        const alertHtml = `
            <div class="alert ${alertClass}">
                <div class="alert-icon">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${title}</div>
                    <div class="alert-message">${message}</div>
                </div>
                <div class="alert-close">
                    <i class="fa-solid fa-xmark"></i>
                </div>
            </div>
        `;
        
        // Clear previous alerts to prevent stacking if too many
        $container.empty();
        
        // Append new alert
        const $alert = $(alertHtml);
        $container.append($alert);
        
        // Close event
        $alert.find('.alert-close').on('click', function() {
            $alert.slideUp(300, function() {
                $(this).remove();
            });
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if ($alert.length) {
                $alert.slideUp(300, function() {
                    $(this).remove();
                });
            }
        }, 5000);
    }
});
