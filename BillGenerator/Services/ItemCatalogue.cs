using BillGenerator.Models;

namespace BillGenerator.Services;

/// <summary>
/// Provides a master list of menu items and deterministic / random selection helpers.
/// </summary>
public static class ItemCatalogue
{
    public static IReadOnlyList<Item> Snacks { get; } = new List<Item>
    {
        new("Samosa",            0, 35),
        new("Paneer Pakora",     0, 120),
        new("Veg Cutlet",        0, 90),
        new("Dahi Bhalla",       0, 110),
        new("Kachori",           0, 40),
        new("Aloo Tikki",        0, 85),
        new("Spring Roll",       0, 130),
        new("Cheese Corn Balls", 0, 150),
        new("Masala Dosa",       0, 140),
        new("Chole Bhature",     0, 170)
    };

    public static IReadOnlyList<Item> MainCourse { get; } = new List<Item>
    {
        new("Tandoori Roti",       0, 25),
        new("Butter Roti",         0, 30),
        new("Missi Roti",          0, 45),
        new("Plain Naan",          0, 55),
        new("Butter Naan",         0, 65),
        new("Lachha Paratha",      0, 80),
        new("Paneer Butter Masala",0, 260),
        new("Kadai Paneer",        0, 250),
        new("Mix Veg Curry",       0, 220),
        new("Dal Tadka",           0, 190),
        new("Aloo Jeera",          0, 170),
        new("Palak Paneer",        0, 270),
        new("Malai Kofta",         0, 280),
        new("Matar Mushroom",      0, 240),
        new("Veg Kolhapuri",       0, 230),
        new("Shahi Paneer",        0, 290),
        new("Methi Malai Matar",   0, 250),
        new("Veg Biryani",         0, 210),
        new("Jeera Rice",          0, 160)
    };

    public static IReadOnlyList<Item> All => Snacks.Concat(MainCourse).ToList();

    // ── Deterministic selection (seeded RNG – same as original code) ──────────

    /// <summary>
    /// Builds a deterministic item list for <paramref name="date"/> that ensures
    /// the bill total is above ₹1 000.
    /// </summary>
    public static List<Item> BuildForDate(DateTime date)
    {
        var random = new Random(date.Day);
        var snacks = Snacks.ToList();
        var mains  = MainCourse.ToList();

        var items = new List<Item>();

        for (int i = 0; i < 4; i++)
        {
            var s = snacks[random.Next(snacks.Count)];
            items.Add(new Item(s.Name, random.Next(1, 4), s.Price));
        }

        for (int i = 0; i < 5; i++)
        {
            var m = mains[random.Next(mains.Count)];
            items.Add(new Item(m.Name, random.Next(1, 5), m.Price));
        }

        while (items.Sum(x => x.Amount) <= 1000)
        {
            int idx = random.Next(items.Count);
            items[idx].Quantity += 1;
        }

        return items;
    }

    // ── Evening time (deterministic) ─────────────────────────────────────────

    public static TimeOnly EveningTimeForDate(DateTime date)
    {
        var random = new Random(date.DayOfYear * 37);
        return new TimeOnly(random.Next(9, 11), random.Next(0, 60));
    }

    // ── Business day filter ───────────────────────────────────────────────────

    public static bool IsIndianBusinessDay(DateTime date) =>
        date.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday
            or DayOfWeek.Tuesday or DayOfWeek.Thursday);
}
