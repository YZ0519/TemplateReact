using Application.Projects.Commands;
using FluentValidation;

namespace Application.Projects.Validators;

public class AddFeatureValidator : AbstractValidator<AddFeature.Command>
{
    public AddFeatureValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
    }
}
