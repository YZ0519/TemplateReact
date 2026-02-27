using Domain;
using Microsoft.AspNetCore.Identity;

namespace Persistence;

public class DBInitializer
{
    public static async Task SeedData(AppDbContext context, UserManager<User> userManager)
    {
        if (userManager.Users.Any()) return;

        var users = new List<User>
        {
            new() { DisplayName = "Admin", UserName = "admin@test.com", Email = "admin@test.com" },
        };

        foreach (var user in users)
        {
            await userManager.CreateAsync(user, "Pa$$w0rd");
        }
    }
}
