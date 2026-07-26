using System.ComponentModel.DataAnnotations;

namespace ElectroPi.TaskManager.Application.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class NotDefaultDateAttribute : ValidationAttribute
{
    public NotDefaultDateAttribute()
        : base("The {0} field must contain a valid date.")
    {
    }

    public override bool IsValid(object? value)
    {
        return value is DateTime date && date != default;
    }
}
