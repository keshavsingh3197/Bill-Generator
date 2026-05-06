namespace BillGenerator.Models;

public class Item
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public double Price { get; set; }

    public Item() { }

    public Item(string name, int qty, double price)
    {
        Name = name;
        Quantity = qty;
        Price = price;
    }

    public double Amount => Quantity * Price;
}
