using Application.Interfaces;
using Application.Profiles.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Persistence;

namespace API.Tests.Infrastructure;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection;

    public Mock<IPhotoService> PhotoServiceMock { get; } = new Mock<IPhotoService>();

    public CustomWebApplicationFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["CloudinarySettings:CloudName"] = "test-cloud",
                ["CloudinarySettings:ApiKey"] = "123456789",
                ["CloudinarySettings:ApiSecret"] = "test-secret"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Remove the existing AppDbContext options registration
            var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (dbContextDescriptor != null)
                services.Remove(dbContextDescriptor);

            // Also remove any AppDbContext registrations
            var dbContextService = services.SingleOrDefault(
                d => d.ServiceType == typeof(AppDbContext));
            if (dbContextService != null)
                services.Remove(dbContextService);

            // Register AppDbContext using the shared in-memory SQLite connection
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlite(_connection);
            });

            // Remove the real IPhotoService and replace with mock
            var photoServiceDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IPhotoService));
            if (photoServiceDescriptor != null)
                services.Remove(photoServiceDescriptor);

            services.AddScoped<IPhotoService>(_ => PhotoServiceMock.Object);
        });

        builder.UseEnvironment("Test");
    }

    public async Task InitialiseAsync()
    {
        using var scope = Services.CreateScope();
        await TestHelpers.SeedDatabaseAsync(scope);
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _connection.Close();
            _connection.Dispose();
        }
    }
}
