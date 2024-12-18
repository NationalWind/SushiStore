GO
USE SushiDB
GO


-- Tạo món ăn
CREATE PROCEDURE sp_TaoMonAn
	@MaMon CHAR(10),
	@TenMon NVARCHAR(50),
	@GiaHienTai FLOAT,
	@DanhMuc NVARCHAR(50),
	@TrangThaiPhucVu NVARCHAR(20)
AS
BEGIN
	SET NOCOUNT ON;

	INSERT INTO MONAN (MAMON, TENMON, GIAHIENTAI, DANHMUC, TRANGTHAIPHUCVU)
	VALUES (@MaMon, @TenMon, @GiaHienTai, @DanhMuc, @TrangThaiPhucVu)
END;
GO

EXEC sp_TaoMonAn 'MONAN00001', N'Nigiri Cá Hồi', 35000, 'Nigiri', N'Có phục vụ';
EXEC sp_TaoMonAn 'MONAN00002', N'Nigiri Cá Hồi', 30000, 'Nigiri', N'Có phục vụ';


-- Tạo chi tiết món ăn cho món ăn lẻ
CREATE PROCEDURE sp_TaoChiTietMonAn_Mon
	@MaCTMon CHAR(10),
	@MaMon CHAR(10),
	@SoLuong INT,
	@GhiChu NVARCHAR(MAX),
	@MaDonDatMon CHAR(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @DonGiaTong FLOAT;

	SELECT @DonGiaTong = MA.GIAHIENTAI * @SoLuong
	FROM MONAN MA
	WHERE MA.MAMON = @MaMon;

	INSERT INTO CHITIETMONAN (MACTMON, MAMON, SOLUONG, GHICHU, DONGIATONG, MADONDATMON)
	VALUES (@MaCTMon, @MaMon, @SoLuong, @GhiChu, @DonGiaTong, @MaDonDatMon)
END;
GO

EXEC sp_TaoChiTietMonAn_Mon 'CTMONAN001', 'MONAN00001', '2', N'Không có gì', NULL;


-- Tạo chi tiết món ăn cho combo món ăn
CREATE PROCEDURE sp_TaoChiTietMonAn_Combo
	@MaCTMon CHAR(10),
	@MaCombo CHAR(10),
	@SoLuong INT,
	@GhiChu NVARCHAR(MAX),
	@MaDonDatMon CHAR(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @DonGiaTong FLOAT;

	SELECT @DonGiaTong = CB.DONGIACOMBO * @SoLuong
	FROM COMBOMONAN CB
	WHERE CB.DONGIACOMBO = @MaCombo;

	INSERT INTO CHITIETMONAN (MACTMON, MACOMBO, SOLUONG, GHICHU, DONGIATONG, MADONDATMON)
	VALUES (@MaCTMon, @MaCombo, @SoLuong, @GhiChu, @DonGiaTong, @MaDonDatMon)
END;
GO

EXEC sp_TaoChiTietMonAn_Combo 'CTMONAN002', 'COMBO00001', '3', N'Không có gì', NULL;


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
    DECLARE @DonGiaCombo FLOAT;

    SELECT @DonGiaCombo = SUM(MA.GIAHIENTAI * DM.SOLUONG)
    FROM @DanhSachMon DM
    JOIN MONAN MA ON DM.MaMon = MA.MAMON;

    INSERT INTO COMBOMONAN (MACOMBO, TENCOMBO, MOTACOMBO, DONGIACOMBO)
    VALUES (@MaCombo, @TenCombo, @MoTaCombo, @DonGiaCombo);

    INSERT INTO MONAN_COMBOMONAN (MACOMBO, MAMON, SOLUONG)
    SELECT @MaCombo, MaMon, SoLuong
    FROM @DanhSachMon;
END;
GO

-- Exec thử
DECLARE @DanhSachMon DanhSachMonAn;
INSERT INTO @DanhSachMon (MaMon, SoLuong)
VALUES 
    ('MONAN00001', 2),
    ('MONAN00002', 1);

-- Bước 3: Gọi thủ tục và truyền biến bảng
EXEC sp_TaoComboMonAn 
    @MaCombo = 'COMBO00001', 
    @TenCombo = N'Combo nigiri',
    @MoTaCombo = N'Combo bao gồm nigiri cá hồi và nigiri cá ngừ.',
    @DanhSachMon = @DanhSachMon;