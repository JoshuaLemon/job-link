using JobPlatform.API.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using JobPlatform.API.Services;
namespace JobPlatform.API.Documents;

public class ResumeDocument : IDocument
{
    private readonly ResumeResponse _resume;

    public ResumeDocument(ResumeResponse resume)
    {
        _resume = resume;
    }

    public DocumentMetadata GetMetadata()
    {
        return DocumentMetadata.Default;
    }

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);

            // Smaller margins to maximize space
            page.Margin(30);

            page.DefaultTextStyle(x =>
                x.FontFamily("Arial")
                .FontSize(10)
                .LineHeight(1.2f));

            page.Content().Column(column =>
            {
                column.Spacing(10);

                ComposeHeader(column);

                ComposeSummary(column);

                ComposeSkills(column);

                // Fresh graduates
                if (_resume.Experiences.Count == 0)
                {
                    ComposeEducation(column);
                }
                else
                {
                    ComposeExperience(column);

                    ComposeEducation(column);
                }
            });
        });
    }

    // HEADER
    private void ComposeHeader(ColumnDescriptor column)
    {
        column.Item()
            .AlignCenter()
            .Text($"{_resume.FirstName.ToUpper()} {_resume.LastName.ToUpper()}")
            .Bold()
            .FontSize(24);

        if (!string.IsNullOrWhiteSpace(_resume.Headline))
        {
            column.Item()
                .AlignCenter()
                .Text(_resume.Headline)
                .Bold()
                .FontSize(11);
        }

        column.Item()
            .AlignCenter()
            .Text(text =>
            {
                text.Span(_resume.Email);

                if (!string.IsNullOrWhiteSpace(_resume.PhoneNumber))
                {
                    text.Span(" • ");
                    text.Span(_resume.PhoneNumber);
                }

                if (!string.IsNullOrWhiteSpace(_resume.Location))
                {
                    text.Span(" • ");
                    text.Span(_resume.Location);
                }
            });

        column.Item()
            .PaddingTop(4)
            .PaddingBottom(2)
            .LineHorizontal(1)
            .LineColor(Colors.Black);
    }

    // SUMMARY
    private void ComposeSummary(ColumnDescriptor column)
    {
        SectionTitle(column, "PROFESSIONAL SUMMARY");

        column.Item().Text(
            ResumeSummaryGenerator.Generate(_resume)
        );
    }

    // SKILLS
    private void ComposeSkills(ColumnDescriptor column)
    {
        SectionTitle(column, "TECHNICAL SKILLS");

        if (_resume.Skills.Count == 0)
        {
            column.Item().Text("No skills added.");
            return;
        }

        var orderedSkills = _resume.Skills
            .OrderBy(s => s)
            .ToList();

        column.Item().Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn();
                columns.RelativeColumn();
                columns.RelativeColumn();
                columns.RelativeColumn();
            });

            foreach (var skill in orderedSkills)
            {
                table.Cell()
                    .PaddingBottom(2)
                    .Text($"• {skill}");
            }
        });
    }

    
    // EXPERIENCE
    private void ComposeExperience(ColumnDescriptor column)
    {
        SectionTitle(column, "PROFESSIONAL EXPERIENCE");

        if (_resume.Experiences.Count == 0)
        {
            column.Item().Text("No professional experience.");
            return;
        }

        foreach (var experience in _resume.Experiences)
        {
            // Company + Dates
            column.Item().Row(row =>
            {
                row.RelativeItem()
                    .Text(experience.CompanyName)
                    .Bold()
                    .FontSize(10.5f);

                row.ConstantItem(110)
                    .AlignRight()
                    .Text($"{experience.StartDate:MMM yyyy} - {experience.EndDate:MMM yyyy}")
                    .FontSize(8.5f)
                    .Italic()
                    .FontColor(Colors.Grey.Darken2);
            });

            // Job Title
            column.Item()
                .PaddingBottom(2)
                .Text(experience.JobTitle)
                .Italic();

            // Description
            if (!string.IsNullOrWhiteSpace(experience.Description))
            {
                var bullets = experience.Description
                    .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Take(5);

                foreach (var bullet in bullets)
                {
                    column.Item()
                        .PaddingLeft(8)
                        .PaddingBottom(1)
                        .Text($"• {bullet.Trim()}");
                }
            }

            column.Item().PaddingBottom(6);
        }
    }

    // EDUCATION
    private void ComposeEducation(ColumnDescriptor column)
    {
        SectionTitle(column, "EDUCATION");

        if (_resume.Educations.Count == 0)
        {
            column.Item().Text("No education added.");
            return;
        }

        foreach (var education in _resume.Educations)
        {
            column.Item().Row(row =>
            {
                row.RelativeItem()
                    .Text(education.SchoolName)
                    .Bold();

                row.ConstantItem(110)
                    .AlignRight()
                    .Text($"{education.StartDate:yyyy} - {education.EndDate:yyyy}")
                    .FontSize(8.5f)
                    .Italic()
                    .FontColor(Colors.Grey.Darken2);
            });

            column.Item()
                .Text(education.Degree)
                .SemiBold();

            if (!string.IsNullOrWhiteSpace(education.FieldOfStudy))
            {
                column.Item().Text(education.FieldOfStudy);
            }

            column.Item().PaddingBottom(5);
        }
    }

    // SECTION TITLE
    private static void SectionTitle(ColumnDescriptor column, string title)
    {
        column.Item()
            .PaddingTop(2)
            .Text(title)
            .Bold()
            .FontSize(11);

        column.Item()
            .PaddingTop(1)
            .PaddingBottom(4)
            .LineHorizontal(0.8f)
            .LineColor(Colors.Black);
    }
}