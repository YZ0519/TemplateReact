using Application.Projects.Commands;
using FluentValidation;

namespace Application.Projects.Validators;

public class AddTechStackValidator : AbstractValidator<AddTechStack.Command>
{
    public AddTechStackValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required")
            .MaximumLength(50).WithMessage("Category must not exceed 50 characters");
    }
}
