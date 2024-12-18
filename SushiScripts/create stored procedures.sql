
GO
USE SushiDB
GO

CREATE PROCEDURE SP_CapNhatHangThe
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MAKHACHHANG CHAR(10);
    DECLARE @MATHE CHAR(10);
    DECLARE @DIEMTICHLUY INT;
    DECLARE @LOAITHE NVARCHAR(50);
    DECLARE @NGAYNANGHANG DATE;
    DECLARE @DIEMTRONGNAM INT;

    -- Cursor to iterate through all customers whose last upgrade/downgrade is exactly 1 year ago
    DECLARE CardCursor CURSOR FOR
    SELECT C.MAKHACHHANG, C.MATHE, C.DIEMTICHLUY, T.LOAITHE, C.NGAYNANGHANG
    FROM CHITIETKHACHHANG C
    JOIN THETHANHVIEN T ON C.MATHE = T.MATHE
    WHERE DATEDIFF(DAY, NGAYNANGHANG, GETDATE()) >= 365;

    OPEN CardCursor;
    FETCH NEXT FROM CardCursor INTO @MAKHACHHANG, @MATHE, @DIEMTICHLUY, @LOAITHE, @NGAYNANGHANG;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Reset @DIEMTRONGNAM each iteration
        SET @DIEMTRONGNAM = @DIEMTICHLUY;

        -- Logic to process Membership
        IF @LOAITHE = N'Membership'
        BEGIN
            IF @DIEMTRONGNAM >= 100
            BEGIN
                -- Upgrade to SILVER
                UPDATE THETHANHVIEN
                SET LOAITHE = N'Silver'
                WHERE MATHE = @MATHE;

                UPDATE CHITIETKHACHHANG
                SET NGAYNANGHANG = GETDATE(), DIEMTICHLUY = 0
                WHERE MAKHACHHANG = @MAKHACHHANG AND MATHE = @MATHE;

                PRINT 'Khách hàng đã được nâng cấp lên hạng thẻ SILVER.';
            END
        END

        ELSE IF @LOAITHE = N'Silver'
        BEGIN
            IF @DIEMTRONGNAM >= 100
            BEGIN
                -- Upgrade to GOLD
                UPDATE THETHANHVIEN
                SET LOAITHE = N'Gold'
                WHERE MATHE = @MATHE;

                UPDATE CHITIETKHACHHANG
                SET NGAYNANGHANG = GETDATE(), DIEMTICHLUY = 0
                WHERE MAKHACHHANG = @MAKHACHHANG AND MATHE = @MATHE;

                PRINT 'Khách hàng đã được nâng cấp lên hạng thẻ GOLD.';
            END
            ELSE IF @DIEMTRONGNAM < 50
            BEGIN
                -- Downgrade to Membership
                UPDATE THETHANHVIEN
                SET LOAITHE = N'Membership'
                WHERE MATHE = @MATHE;

                UPDATE CHITIETKHACHHANG
                SET NGAYNANGHANG = GETDATE(), DIEMTICHLUY = 0
                WHERE MAKHACHHANG = @MAKHACHHANG AND MATHE = @MATHE;

                PRINT 'Khách hàng đã bị hạ cấp xuống hạng thẻ MEMBERSHIP.';
            END
            ELSE
            BEGIN
                PRINT 'Khách hàng giữ nguyên hạng thẻ SILVER.';
            END
        END

        ELSE IF @LOAITHE = N'Gold'
        BEGIN
            IF @DIEMTRONGNAM < 100
            BEGIN
                -- Downgrade to SILVER
                UPDATE THETHANHVIEN
                SET LOAITHE = N'Silver'
                WHERE MATHE = @MATHE;

                UPDATE CHITIETKHACHHANG
                SET NGAYNANGHANG = GETDATE(), DIEMTICHLUY = 0
                WHERE MAKHACHHANG = @MAKHACHHANG AND MATHE = @MATHE;

                PRINT 'Khách hàng đã bị hạ cấp xuống hạng thẻ SILVER.';
            END
            ELSE
            BEGIN
                PRINT 'Khách hàng giữ nguyên hạng thẻ GOLD.';
            END
        END

        -- Move to the next customer
        FETCH NEXT FROM CardCursor INTO @MAKHACHHANG, @MATHE, @DIEMTICHLUY, @LOAITHE, @NGAYNANGHANG;
    END;

    CLOSE CardCursor;
    DEALLOCATE CardCursor;
END;

GO


CREATE PROCEDURE SP_TaoVaCapThe
(
    @MAKHACHHANG CHAR(10),           -- Mã khách hàng
    @HOTEN NVARCHAR(50),             -- Họ tên khách hàng
    @SDT CHAR(10),                   -- Số điện thoại
    @EMAIL VARCHAR(50),              -- Email khách hàng
    @CCCD VARCHAR(20),               -- CCCD khách hàng
    @MATHE CHAR(10),                 -- Mã thẻ thành viên
    @NHANVIENTAOLAP CHAR(10)         -- Nhân viên tạo lập thẻ
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra xem khách hàng đã tồn tại trong bảng KHACHHANG hay chưa
    IF NOT EXISTS (SELECT 1 FROM KHACHHANG WHERE MAKHACHHANG = @MAKHACHHANG)
    BEGIN
        -- Thêm thông tin khách hàng mới
        INSERT INTO KHACHHANG (MAKHACHHANG, HOTEN, SDT, EMAIL, CCCD)
        VALUES (@MAKHACHHANG, @HOTEN, @SDT, @EMAIL, @CCCD);

        PRINT 'Khách hàng mới đã được thêm vào hệ thống.';
    END
    ELSE
    BEGIN
        PRINT 'Khách hàng đã tồn tại.';
    END

    -- Kiểm tra xem thẻ đã tồn tại trong bảng CHITIETKHACHHANG hay chưa
    IF NOT EXISTS (SELECT 1 FROM CHITIETKHACHHANG WHERE MAKHACHHANG = @MAKHACHHANG AND MATHE = @MATHE)
    BEGIN
        -- Cấp thẻ mới với loại thẻ Membership và trạng thái Active
        INSERT INTO CHITIETKHACHHANG (MAKHACHHANG, MATHE, NGAYDK, DIEMTICHLUY, NGAYNANGHANG, TRANGTHAITAIKHOAN, NHANVIENTAOLAP)
        VALUES (@MAKHACHHANG, @MATHE, GETDATE(), 0, NULL, N'Active', @NHANVIENTAOLAP);

        -- Đặt loại thẻ mặc định là Membership trong bảng THETHANHVIEN nếu chưa có
        IF NOT EXISTS (SELECT 1 FROM THETHANHVIEN WHERE MATHE = @MATHE)
        BEGIN
            INSERT INTO THETHANHVIEN (MATHE, LOAITHE)
            VALUES (@MATHE, N'Membership');
        END

        PRINT 'Thẻ mới đã được cấp cho khách hàng.';
    END
    ELSE
    BEGIN
        -- Cập nhật thông tin thẻ nếu khách hàng đã có thẻ
        UPDATE CHITIETKHACHHANG
        SET NGAYDK = GETDATE(),
            TRANGTHAITAIKHOAN = N'Active',
            NHANVIENTAOLAP = @NHANVIENTAOLAP
        WHERE MAKHACHHANG = @MAKHACHHANG AND MATHE = @MATHE;

        PRINT 'Thông tin thẻ đã được cập nhật.';
    END
END;
GO


-- Xem danh sách nhân viên và đánh giá tương ứng với mỗi nhân viên đó
CREATE PROCEDURE XemDanhSachDanhGiaNhanVien
AS
BEGIN
    -- Hiển thị danh sách nhân viên kèm theo thông tin đánh giá
    SELECT 
        NV.MANHANVIEN AS MaNhanVien,
        NV.HOTEN AS HoTen,
        NV.CHINHANHLAMVIEC AS MaChiNhanh,
        CN.TENCHINHANH AS TenChiNhanh,
        ISNULL(AVG(DG.DIEMPHUCVU), 0) AS DiemPhucVuTB,
        ISNULL(AVG(DG.DIEMVITRICHINHANH), 0) AS DiemViTriChiNhanhTB,
        ISNULL(AVG(DG.DIEMKHONGGIAN), 0) AS DiemKhongGianTB,
        COUNT(DG.MADANHGIA) AS SoLuotDanhGia,
        STRING_AGG(DG.BINHLUAN, '; ') AS BinhLuan
    FROM 
        NHANVIEN NV
    LEFT JOIN 
        DANHGIA DG ON NV.MANHANVIEN = DG.NHANVIEN
    LEFT JOIN 
        CHINHANH CN ON NV.CHINHANHLAMVIEC = CN.MACHINHANH
    GROUP BY 
        NV.MANHANVIEN, NV.HOTEN, NV.CHINHANHLAMVIEC, CN.TENCHINHANH
    ORDER BY 
        NV.MANHANVIEN;
END;

EXEC XemDanhSachDanhGiaNhanVien;

--
GO


-- Thống kê chất lượng món ăn và đánh giá của khách hàng
CREATE PROCEDURE THONGKE_CHATLUONG_MONAN
    @NGAYBATDAU DATE 
AS
BEGIN
    -- Truy vấn thống kê chất lượng món ăn từ ngày bắt đầu đến ngày hiện tại
    SELECT
        M.TENMON,
        CONVERT(DATE, DD.NGAYDAT) AS NGAY_DG,
        AVG(DGM.DIEMCHATLUONGMONAN) AS DIEMCHATLUONG_TB, 
        AVG(DGM.DIEMGIACA) AS DIEMGIACA_TB, 
        COUNT(DG.MADANHGIA) AS SO_LUONG_DANHGIA 
    FROM
        MONAN M
    JOIN
        DANHGIAMONAN DGM ON M.MAMON = DGM.MAMON
    JOIN
        DANHGIA DG ON DGM.MADANHGIA = DG.MADANHGIA
    JOIN
        DONDATMON DD ON DG.MADON = DD.MADON -- Liên kết với bảng Đơn đặt món để lấy ngày đánh giá
    WHERE
        DD.NGAYDAT >= @NGAYBATDAU 
        AND DD.NGAYDAT <= GETDATE() 
    GROUP BY
        M.TENMON, CONVERT(DATE, DD.NGAYDAT) -- Nhóm theo tên món và ngày đánh giá
    ORDER BY
        NGAY_DG DESC, DIEMCHATLUONG_TB DESC; -- Sắp xếp theo ngày đánh giá và điểm chất lượng món ăn

    PRINT 'Thống kê chất lượng món ăn đã được thực hiện thành công';
END;

EXEC THONGKE_CHATLUONG_MONAN @NGAYBATDAU = '2024-01-01';


-- Thống kê danh sách các đơn hàng và hóa đơn theo ngày đặt cụ thể
CREATE PROCEDURE SP_DS_DONDATMON_HOADON_THEONGAY
    @ngaydat DATE -- Tham số đầu vào để lọc theo ngày đặt
AS
BEGIN
    SELECT 
        DD.MADON AS MaDonHang,
        DD.GIODAT AS GioDatHang,
        KH.HOTEN AS TenKhachHang,
        KH.SDT AS SoDienThoai,
        HD.MAHOADON AS MaHoaDon,
        HD.TONGTIENSAUKM AS ThanhTien,
        HD.TRANGTHAI AS TrangThaiHoaDon,
        CASE 
            WHEN DHTT.MADHTRUCTUYEN IS NOT NULL THEN N'Đặt hàng trực tuyến'
            WHEN DHTC.MADHTAICHO IS NOT NULL THEN N'Đặt hàng tại chỗ'
        END AS LoaiDonHang,
        -- Chỉ hiển thị thông tin giao hàng trực tuyến nếu là đặt hàng trực tuyến
        CASE 
            WHEN DHTT.MADHTRUCTUYEN IS NOT NULL THEN DHTT.THOIGIANGIAO 
            ELSE NULL 
        END AS ThoiGianGiaoHang,
        CASE 
            WHEN DHTT.MADHTRUCTUYEN IS NOT NULL THEN DHTT.DIACHIGIAO 
            ELSE NULL 
        END AS DiaChiGiaoHang,
        -- Chỉ hiển thị thông tin tại chỗ nếu là đặt hàng tại chỗ
        CASE 
            WHEN DHTC.MADHTAICHO IS NOT NULL THEN DHTC.SOBAN 
            ELSE NULL 
        END AS SoBanTaiCho,
        CASE 
            WHEN DHTC.MADHTAICHO IS NOT NULL THEN DHTC.MACHINHANH 
            ELSE NULL 
        END AS ChiNhanhTaiCho
    FROM 
        DONDATMON DD
    LEFT JOIN 
        HOADON HD ON DD.HOADONLIENQUAN = HD.MAHOADON
    LEFT JOIN 
        DATHANGTRUCTUYEN DHTT ON DD.MADON = DHTT.MADHTRUCTUYEN
    LEFT JOIN 
        DATHANGTAICHO DHTC ON DD.MADON = DHTC.MADHTAICHO
    LEFT JOIN 
        KHACHHANG KH ON DD.KHACHHANGDAT = KH.MAKHACHHANG
    WHERE 
        DD.NGAYDAT = @ngaydat 
    ORDER BY 
        DD.GIODAT ASC
END

EXEC SP_DS_DONDATMON_HOADON_THEONGAY @ngaydat = '2024-12-17'


-- Danh sách theo dõi xu hướng của các khách hàng khi lựa chọn loại đặt hàng tại một chi nhánh trong một khoảng thời gian
CREATE PROCEDURE SP_THONGKE_XUHUONG_KHACHHANG
    @ngayBatDau DATE,
    @ngayKetThuc DATE,
    @maChiNhanh CHAR(10)
AS
BEGIN
    SELECT 
        KH.MAKHACHHANG,
        KH.HOTEN,
        KH.SDT,
        DH.MACHINHANH,
        COUNT(DH.MADHTAICHO) AS SO_LUONG_DH_TAI_CHO,
        COUNT(DT.MADHTRUCTUYEN) AS SO_LUONG_DH_TRUC_TUYEN
    FROM 
        KHACHHANG KH
    LEFT JOIN 
        DONDATMON D ON KH.MAKHACHHANG = D.KHACHHANGDAT
    LEFT JOIN 
        DATHANGTAICHO DH ON D.MADON = DH.MADHTAICHO
    LEFT JOIN 
        DATHANGTRUCTUYEN DT ON D.MADON = DT.MADHTRUCTUYEN
    WHERE 
        D.NGAYDAT BETWEEN @ngayBatDau AND @ngayKetThuc
        AND DH.MACHINHANH = @maChiNhanh 
    GROUP BY 
        KH.MAKHACHHANG,
        KH.HOTEN,
        KH.SDT,
        DH.MACHINHANH;
END

EXEC THONGKE_XUHUONG_KHACHHANG @ngayBatDau = '2024-12-12', @ngayKetThuc = '2025-1-12', @maChiNhanh = 'CN0001'


CREATE PROCEDURE 
EXEC SP_THONGKE_XUHUONG_KHACHHANG @ngayBatDau = '2024-12-12', @ngayKetThuc = '2025-1-12', @maChiNhanh = 'CN0001'

-- Tính toán tổng tiền trước và sau khuyến mãi, sau đó cập nhật theo mã hóa đơn.

CREATE PROCEDURE SP_TinhVaCapNhatTongTien
    @MAHOADON CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM HOADON WHERE MAHOADON = @MAHOADON)
    BEGIN
        RAISERROR('Mã hóa đơn không hợp lệ.', 16, 1);
        RETURN; 
    END

    DECLARE @TONGTIENTRUOCKM FLOAT;
    SET @TONGTIENTRUOCKM = (
        SELECT SUM(THANHTIEN) * (1 + VAT)
        FROM DONDATMON
        JOIN HOADON ON DONDATMON.HOADONLIENQUAN = HOADON.MAHOADON
        WHERE DONDATMON.HOADONLIENQUAN = @MAHOADON AND DONDATMON.TRANGTHAI = N'Thành công'
    );

    DECLARE @LUONGKMTIEN FLOAT;
    SET @LUONGKMTIEN = ISNULL((
        SELECT TOP 1 LUONGKMTIEN
        FROM KHUYENMAIKHACHHANG
        WHERE KHUYENMAIKHACHHANG.MAKHACHHANG = (SELECT MAKHACHHANG FROM HOADON WHERE MAHOADON = @MAHOADON)
          AND TRANGTHAIDUNG = 1
          AND GETDATE() BETWEEN NGAYBATDAU AND NGAYKETTHUC
          AND @TONGTIENTRUOCKM >= GIATRITOITHIEU
        ORDER BY LUONGKMTIEN DESC
    ), 0);

    DECLARE @LUONGKMPHANTRAM FLOAT;
    SET @LUONGKMPHANTRAM = ISNULL((
        SELECT TOP 1 LUONGKMPHANTRAM
        FROM KHUYENMAITHETHANHVIEN
        WHERE MATHE = (SELECT MATHE 
                       FROM CHITIETKHACHHANG
                       WHERE MAKHACHHANG = (SELECT MAKHACHHANG FROM HOADON WHERE MAHOADON = @MAHOADON))
    ), 0);

    DECLARE @TONGTIENSAUKM FLOAT;
    SET @TONGTIENSAUKM = (@TONGTIENTRUOCKM - @LUONGKMTIEN) * (1 - @LUONGKMPHANTRAM);

    UPDATE HOADON
    SET TONGTIENTRUOCKM = @TONGTIENTRUOCKM,
        TONGTIENSAUKM = @TONGTIENSAUKM
    WHERE MAHOADON = @MAHOADON;

	UPDATE DONDATMON
	SET TRANGTHAI = N'Đã thanh toán'
	WHERE HOADONLIENQUAN = @MAHOADON
END;
GO

-- Thống kê doanh thu của một chi nhánh
CREATE PROCEDURE sp_ThongKeDoanhThu
    @MACHI_NHANH CHAR(10),
    @NGAYBATDAU DATE, 
    @NGAYKETTHUC DATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM CHINHANH WHERE MACHINHANH = @MACHI_NHANH)
    BEGIN
        RAISERROR('Chi nhánh không tồn tại.', 16, 1);
        RETURN;
    END

    IF @NGAYBATDAU > @NGAYKETTHUC
    BEGIN
        RAISERROR('Ngày bắt đầu không thể lớn hơn ngày kết thúc.', 16, 1);
        RETURN;
    END

    DECLARE @TONGDOANHTHU FLOAT;
    SET @TONGDOANHTHU = (
        SELECT SUM(DONDATMON.THANHTIEN)
        FROM DONDATMON
        WHERE DONDATMON.CHINHANHDAT = @MACHI_NHANH
          AND DONDATMON.TRANGTHAI = N'Đã thanh toán'
          AND DONDATMON.NGAYDAT >= @NGAYBATDAU
          AND DONDATMON.NGAYDAT <= @NGAYKETTHUC
    );

    IF @TONGDOANHTHU IS NULL
    BEGIN
        SET @TONGDOANHTHU = 0;
    END

    SELECT @TONGDOANHTHU AS TONGDOANHTHU;
END;
GO
