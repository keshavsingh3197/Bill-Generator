namespace BillGeneratorApi.Models;

public class BillData
{
    public List<Item> Items { get; set; } = new();
    public DateTime BillDate { get; set; } = DateTime.Now;
    public TimeOnly BillTime { get; set; } = TimeOnly.FromDateTime(DateTime.Now);
    public string CashierName { get; set; } = string.Empty;
    public string OutputPath { get; set; } = string.Empty;
}
