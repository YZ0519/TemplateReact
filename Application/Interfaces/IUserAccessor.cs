using Domain;
using System;
namespace Application.Interfaces
{
    public interface IUserAccessor
    {
        string GetUserId();
        Task<User> GetUserAsync();
        Task<User> GetUserWithPhotosAsync();
    }
}
