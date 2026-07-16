using Microsoft.EntityFrameworkCore;
using JobPlatform.API.Models;

namespace JobPlatform.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<EmployeeProfile> EmployeeProfiles => Set<EmployeeProfile>();

    public DbSet<Company> Companies => Set<Company>();

    public DbSet<JobPost> JobPosts => Set<JobPost>();

    public DbSet<Education> Educations => Set<Education>();

    public DbSet<Experience> Experiences => Set<Experience>();

    public DbSet<Skill> Skills => Set<Skill>();

    public DbSet<Application> Applications => Set<Application>();

    public DbSet<SavedJob> SavedJobs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<SavedJob>()
            .HasOne(s => s.EmployeeProfile)
            .WithMany()
            .HasForeignKey(s => s.EmployeeProfileId);

        modelBuilder.Entity<SavedJob>()
            .HasOne(s => s.JobPost)
            .WithMany()
            .HasForeignKey(s => s.JobPostId);
    }
}