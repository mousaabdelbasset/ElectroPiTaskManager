using ElectroPi.TaskManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace ElectroPi.TaskManager.Infrastructure.Data.Configurations
{
    public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
    {
        public void Configure(EntityTypeBuilder<TaskItem> builder)
        {
            builder.ToTable("TaskItems");

            builder.HasKey(task => task.Id);

            builder.Property(task => task.Id)
                .ValueGeneratedOnAdd();

            builder.Property(task => task.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(task => task.Description)
                .HasMaxLength(2000);

            builder.Property(task => task.Status)
                .HasConversion<int>()
                .IsRequired();

            builder.Property(task => task.DueDate)
                .IsRequired();

            builder.HasOne(task => task.Project)
                .WithMany(project => project.Tasks)
                .HasForeignKey(task => task.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(task => task.Status);
        }
    }
}
