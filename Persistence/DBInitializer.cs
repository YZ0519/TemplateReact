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
            new() { DisplayName = "Bob", UserName = "bob@test.com", Email = "bob@test.com" },
            new() { DisplayName = "Tom", UserName = "tom@test.com", Email = "tom@test.com" },
            new() { DisplayName = "Jane", UserName = "jane@test.com", Email = "jane@test.com" }
        };

        foreach (var user in users)
        {
            await userManager.CreateAsync(user, "Pa$$w0rd");
        }
    }
}
