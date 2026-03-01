using Application.Profiles.DTOs;
using Application.Projects.DTOs;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        string? currentUserId = null;

        CreateMap<User, UserProfile>()
            .ForMember(d => d.FollowersCount, o => o.MapFrom(s => s.Followers.Count))
            .ForMember(d => d.FollowingCount, o => o.MapFrom(s => s.Followings.Count))
            .ForMember(d => d.Following, o => o.MapFrom(s => s.Followers.Any(x => x.Observer.Id == currentUserId)));

        CreateMap<Project, ProjectSummaryDto>()
            .ForMember(d => d.HeroScreenshotUrl, o => o.MapFrom(s =>
                s.Screenshots.OrderBy(sc => sc.DisplayOrder).Select(sc => sc.Url).FirstOrDefault()));

        CreateMap<Project, ProjectDetailDto>();
        CreateMap<ProjectTechStack, ProjectTechStackDto>();
        CreateMap<ProjectFeature, ProjectFeatureDto>();
        CreateMap<ProjectScreenshot, ProjectScreenshotDto>();
    }
}
