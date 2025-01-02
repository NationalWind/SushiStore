GO
USE SushiDB
GO


CREATE PROCEDURE sp_TaoMonAnCombo
    @TenMon NVARCHAR(50),
    @DanhMuc NVARCHAR(50),
    @MaChiNhanh CHAR(10),          -- Branch ID
    @GiaHienTai FLOAT,             -- Price for the dish/combo
    @TrangThaiPhucVu NVARCHAR(20), -- Status for the dish/combo (Available, Out of stock, Discontinued)
    @MoTaCombo NVARCHAR(MAX) = NULL -- Description for the combo (only applicable for combos)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaMon CHAR(10);
    DECLARE @MaMenu CHAR(10);
    DECLARE @MaCombo CHAR(10);

    IF @DanhMuc <> 'Combo'
    BEGIN
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
            NULL,              -- No combo for regular dishes
            @GiaHienTai,       -- Price passed as parameter
            @TrangThaiPhucVu   -- Status passed as parameter
        );
    END
    ELSE
    BEGIN
        -- Generate the next MACOMBO by incrementing the highest existing MACOMBO in COMBOMONAN table
        SELECT @MaCombo = 'COMBO' + RIGHT('00000' + CAST(CAST(SUBSTRING(MAX(MACOMBO), 6, 6) AS INT) + 1 AS VARCHAR(5)), 5)
		FROM COMBOMONAN;

        -- Insert into COMBOMONAN table
        INSERT INTO COMBOMONAN (MACOMBO, TENCOMBO, MOTACOMBO)
        VALUES (@MaCombo, @TenMon, @MoTaCombo);

        -- Generate the next MAMENU by incrementing the highest existing MAMENU in MENU table
        SELECT @MaMenu = 'MENU' + RIGHT('000000' + CAST(CAST(SUBSTRING(MAX(MAMENU), 5, 6) AS INT) + 1 AS VARCHAR(6)), 6)
        FROM MENU;

        -- Insert into MENU table
        INSERT INTO MENU (MAMENU, MACHINHANH, MAMON, MACOMBO, GIAHIENTAI, TRANGTHAIPHUCVU)
        VALUES 
        (
            @MaMenu,           -- Newly generated MAMENU
            @MaChiNhanh,       -- Branch ID passed as parameter
            NULL,              -- No dish ID for combos
            @MaCombo,          -- MACOMBO from the new combo
            @GiaHienTai,       -- Price passed as parameter
            @TrangThaiPhucVu   -- Status passed as parameter
        );
    END
END;


-- Tạo món ăn
CREATE PROCEDURE sp_TaoMonAn
	@MaMon CHAR(10),
	@TenMon NVARCHAR(50),
	@DanhMuc NVARCHAR(50)
AS
BEGIN
	SET NOCOUNT ON;

	INSERT INTO MONAN (MAMON, TENMON, DANHMUC)
	VALUES (@MaMon, @TenMon, @DanhMuc)
END;
GO

EXEC sp_TaoMonAn 'MON9000001', N'Salmon Nigiri', 'Nigiri';
EXEC sp_TaoMonAn 'MON9000002', N'Tuna Nigiri', 'Nigiri';
GO


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
