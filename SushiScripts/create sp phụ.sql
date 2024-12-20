GO
USE SushiDB
GO


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
EXEC sp_TaoMonAn 'MON9000002', N'Salmon Nigiri', 'Nigiri';
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
    @PhanTramGiamGia FLOAT,
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
    @PhanTramGiamGia = 0.1,
    @DanhSachMon = @DanhSachMon;