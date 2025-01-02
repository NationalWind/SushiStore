GO
USE SushiDB
GO


-- Tạo món ăn
CREATE or alter PROCEDURE sp_TaoMonAn
    @TenMon NVARCHAR(50),
    @DanhMuc NVARCHAR(50),
    @MaChiNhanh CHAR(10),          -- Branch ID
    @GiaHienTai FLOAT,             -- Price for the dish at the branch
    @TrangThaiPhucVu NVARCHAR(20)  -- Status for the dish (Available, Out of stock, Discontinued)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaMon CHAR(10);
    DECLARE @MaMenu CHAR(10);

    -- Generate the next MAMON by incrementing the highest existing MAMON in MONAN table
    SELECT @MaMon = 'MON' + RIGHT('0000000' + CAST(CAST(SUBSTRING(MAX(MAMON), 4, 7) AS INT) + 1 AS VARCHAR(7)), 7)
    FROM MONAN;

    -- Insert into MONAN table
    INSERT INTO MONAN (MAMON, TENMON, DANHMUC)
    VALUES (@MaMon, @TenMon, @DanhMuc);

    -- Generate the next MAMENU by incrementing the highest existing MAMENU in MENU table
    SELECT @MaMenu = 'MENU' + RIGHT('000000' + CAST(CAST(SUBSTRING(MAX(MAMENU), 5, 6) AS INT) + 1 AS VARCHAR(6)), 6)
    FROM MENU;

    -- Insert into MENU table
    INSERT INTO MENU (MAMENU, MACHINHANH, MAMON, MACOMBO, GIAHIENTAI, TRANGTHAIPHUCVU)
    VALUES 
    (
        @MaMenu,           -- Newly generated MAMENU
        @MaChiNhanh,       -- Branch ID passed as parameter
        @MaMon,            -- MAMON from the new dish
        NULL,              -- No combo in this case
        @GiaHienTai,       -- Price passed as parameter
        @TrangThaiPhucVu   -- Status passed as parameter
    );
END;
GO


EXEC sp_TaoMonAn N'Salmon Nigiri', 'Nigiri', 'CN00000006', 1000000, 'Available';
select * from menu where MACHINHANH = 'CN00000006'
EXEC sp_TaoMonAn 'MON9000002', N'Tuna Nigiri', 'Nigiri';
GO
select * from MONAN
-- Cap nhat trang thai mon an
CREATE PROCEDURE sp_UpdateDishStatus
    @MAMON CHAR(10),
    @TrangThaiPhucVu NVARCHAR(20)
AS
BEGIN
    UPDATE MONAN
    SET TRANGTHAIPHUCVU = @TrangThaiPhucVu
    WHERE MAMON = @MAMON
    AND TRANGTHAIPHUCVU IN (N'Available', N'Out of stock', N'Discontinued');
END
go

CREATE PROCEDURE sp_UpdateDishStatus
    @MAMON CHAR(10),                -- Dish code
    @TRANGTHAIPHUCVU NVARCHAR(20),   -- New status (Available, Out of stock, Discontinued)
    @MACHINHANH CHAR(10)            -- Branch ID
AS
BEGIN
    -- Check if the status is valid
    IF @TRANGTHAIPHUCVU NOT IN (N'Available', N'Out of stock', N'Discontinued')
    BEGIN
        PRINT 'Invalid status value';
        RETURN;
    END

    -- Start a transaction to ensure atomicity
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Update the status of the dish in the MENU table for the given branch
        UPDATE MENU
        SET TRANGTHAIPHUCVU = @TRANGTHAIPHUCVU
        WHERE MAMON = @MAMON AND MACHINHANH = @MACHINHANH;

        -- Commit the transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- If an error occurs, rollback the transaction
        ROLLBACK TRANSACTION;
        PRINT 'An error occurred while updating the status.';
    END CATCH
END


-- Tạo chi tiết món ăn cho menu
CREATE PROCEDURE sp_TaoChiTietMonAn_Mon
	@MaCTMon CHAR(10),
	@MaMenu CHAR(10),
	@SoLuong INT,
	@GhiChu NVARCHAR(MAX),
	@MaDonDatMon CHAR(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @DonGiaTong FLOAT;

	SELECT @DonGiaTong = M.GIAHIENTAI * @SoLuong
	FROM MENU M
	WHERE M.MAMENU = @MaMenu;

	INSERT INTO CHITIETMONAN (MACTMON, MAMENU, SOLUONG, GHICHU, DONGIATONG, MADONDATMON)
	VALUES (@MaCTMon, @MaMenu, @SoLuong, @GhiChu, @DonGiaTong, @MaDonDatMon)
END;
GO

EXEC sp_TaoChiTietMonAn_Mon 'CTMON90001', 'MENU000001', '2', N'Nothing', NULL;
GO


-- Tạo bảng tạm chứa danh sách món cần thêm vào combo
-- Thay đổi khi cần thêm combo mới
CREATE TYPE DanhSachMonAn AS TABLE (
    MaMon CHAR(10),
    SoLuong INT
);
GO
-- DROP TYPE DanhSachMonAn;

-- Tạo combo món ăn
CREATE PROCEDURE sp_TaoComboMonAn
    @MaCombo NVARCHAR(50),
    @TenCombo NVARCHAR(100),
    @MoTaCombo NVARCHAR(MAX),
    @DanhSachMon DanhSachMonAn READONLY  -- Bảng tạm chứa danh sách món
AS
BEGIN
    --DECLARE @DonGiaCombo FLOAT;

    --SELECT @DonGiaCombo = SUM(MA.GIAHIENTAI * DM.SOLUONG) * (1 - @PhanTramGiamGia)
    --FROM @DanhSachMon DM
    --JOIN MONAN MA ON DM.MaMon = MA.MAMON;

    INSERT INTO COMBOMONAN (MACOMBO, TENCOMBO, MOTACOMBO)
    VALUES (@MaCombo, @TenCombo, @MoTaCombo);

    INSERT INTO MONAN_COMBOMONAN (MACOMBO, MAMON, SOLUONG)
    SELECT @MaCombo, MaMon, SoLuong
    FROM @DanhSachMon;
END;
GO

-- Exec thử
DECLARE @DanhSachMon DanhSachMonAn;
INSERT INTO @DanhSachMon (MaMon, SoLuong)
VALUES 
    ('MON8000001', 2),
    ('MON8000002', 1);

-- Bước 3: Gọi thủ tục và truyền biến bảng
EXEC sp_TaoComboMonAn 
    @MaCombo = 'COMBO00001', 
    @TenCombo = N'Combo nigiri',
    @MoTaCombo = N'Combo includes Nigiri and Salmon.',
    @DanhSachMon = @DanhSachMon;
GO

-- Tính toán thành tiền cho đơn đặt món
CREATE PROCEDURE sp_TINHTHANHTIEN_DONDATMON
    @MADON CHAR(10) -- Mã đơn đặt món
AS
BEGIN
    -- Biến để lưu tổng thành tiền
    DECLARE @THANHTIEN FLOAT = 0;

    -- Tính thành tiền từ bảng CHITIETMONAN
    SELECT @THANHTIEN = SUM(CS.DONGIATONG)
    FROM CHITIETMONAN CS
    INNER JOIN DONDATMON DD ON CS.MADONDATMON = DD.MADON
    WHERE DD.MADON = @MADON;

    -- Cập nhật thành tiền vào bảng DONDATMON
    UPDATE DONDATMON
    SET THANHTIEN = @THANHTIEN
    WHERE MADON = @MADON;

    -- Trả về kết quả
    SELECT MADON, THANHTIEN
    FROM DONDATMON
    WHERE MADON = @MADON;
END
