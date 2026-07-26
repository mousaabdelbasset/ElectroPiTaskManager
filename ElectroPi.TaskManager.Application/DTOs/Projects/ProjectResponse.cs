namespace ElectroPi.TaskManager.Application.DTOs.Projects;

public sealed class ProjectResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime CreatedAt { get; init; }
}
