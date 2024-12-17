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

