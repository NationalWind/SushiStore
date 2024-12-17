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
