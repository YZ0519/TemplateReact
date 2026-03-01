using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Persistence;
using System.Net.Http.Json;

namespace API.Tests.Infrastructure;

public static class TestHelpers
{
    public static async Task SeedDatabaseAsync(IServiceScope scope)
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        await context.Database.MigrateAsync();
        await DBInitializer.SeedData(context, userManager);
    }

    public static async Task<HttpClient> CreateAuthenticatedClientAsync(CustomWebApplicationFactory factory)
    {
        var client = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            HandleCookies = true
        });

        var loginPayload = new { email = "admin@test.com", password = "Pa$$w0rd" };
        var response = await client.PostAsJsonAsync("/api/login?useCookies=true", loginPayload);
        response.EnsureSuccessStatusCode();

        return client;
    }
}
