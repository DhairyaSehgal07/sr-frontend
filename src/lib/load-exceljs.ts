export async function loadExcelJS() {
  const module = await import('exceljs');
  return module.default;
}
