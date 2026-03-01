using Application.Projects.Commands;
using FluentValidation;

namespace Application.Projects.Validators;

public class CreateProjectValidator : AbstractValidator<CreateProject.Command>
{
    public CreateProjectValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MinimumLength(3).WithMessage("Title must be at least 3 characters")
            .MaximumLength(100).WithMessage("Title must not exceed 100 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MinimumLength(10).WithMessage("Description must be at least 10 characters")
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");
    }
}
