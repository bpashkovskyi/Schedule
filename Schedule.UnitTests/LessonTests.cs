using FluentAssertions;
using Schedule.Web.Models;
using Schedule.Web.Models.Enums;
using Xunit;

namespace Schedule.UnitTests;

public sealed class LessonTests
{
    [Fact]
    public void Constructor_WithValidData_ShouldSetProperties()
    {
        // Arrange
        var lesson = new Lesson
        {
            Object = "Test Object",
            Date = "2025-01-15",
            Comment = "Test Comment",
            LessonNumber = "1",
            LessonName = "Test Lesson",
            LessonTime = "09:00-10:30",
            LessonDescription = "Test Description"
        };

        // Assert
        lesson.Object.Should().Be("Test Object");
        lesson.Date.Should().Be("2025-01-15");
        lesson.Comment.Should().Be("Test Comment");
        lesson.LessonNumber.Should().Be("1");
        lesson.LessonName.Should().Be("Test Lesson");
        lesson.LessonTime.Should().Be("09:00-10:30");
        lesson.LessonDescription.Should().Be("Test Description");
    }

    [Fact]
    public void Constructor_WithDefaultValues_ShouldSetEmptyStrings()
    {
        Lesson lesson = new();

        lesson.Object.Should().BeEmpty();
        lesson.Date.Should().BeEmpty();
        lesson.Comment.Should().BeEmpty();
        lesson.LessonNumber.Should().BeEmpty();
        lesson.LessonName.Should().BeEmpty();
        lesson.LessonTime.Should().BeEmpty();
        lesson.LessonDescription.Should().BeEmpty();
    }

    [Theory]
    [InlineData("(Л)", LessonType.Lecture)]
    [InlineData("(Лаб)", LessonType.Laboratory)]
    [InlineData("(Пр)", LessonType.Practical)]
    [InlineData("(Зал)", LessonType.Credit)]
    [InlineData("(КЕкз)", LessonType.ExamConsultation)]
    [InlineData("(Екз)", LessonType.Exam)]
    public void LessonType_WithValidTypeInDescription_ShouldReturnCorrectType(string typeMarker, LessonType expectedType)
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = $"Test Lesson {typeMarker} Description"
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        result.Should().Be(expectedType);
    }

    [Fact]
    public void LessonType_WithNoTypeInDescription_ShouldReturnDefault()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson Description"
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        result.Should().Be(default(LessonType));
    }

    [Fact]
    public void LessonType_WithNullDescription_ShouldReturnDefault()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = null
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        result.Should().Be(default(LessonType));
    }

    [Fact]
    public void LessonType_WithEmptyDescription_ShouldReturnDefault()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = ""
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        result.Should().Be(default(LessonType));
    }

    [Fact]
    public void LessonType_WithWhitespaceDescription_ShouldReturnDefault()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "   "
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        result.Should().Be(default(LessonType));
    }

    [Theory]
    [InlineData("мз-", HourType.Hourly)]
    [InlineData("з-", HourType.PartTime)]
    public void HourType_WithValidTypeInDescription_ShouldReturnCorrectType(string typeMarker, HourType expectedType)
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = $"Test Lesson {typeMarker} Description"
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(expectedType);
    }

    [Fact]
    public void HourType_WithNoTypeInDescription_ShouldReturnFullTime()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson Description"
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(HourType.FullTime);
    }

    [Fact]
    public void HourType_WithNullDescription_ShouldReturnFullTime()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = null
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(HourType.FullTime);
    }

    [Fact]
    public void HourType_WithEmptyDescription_ShouldReturnFullTime()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = ""
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(HourType.FullTime);
    }

    [Fact]
    public void HourType_WithWhitespaceDescription_ShouldReturnFullTime()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "   "
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(HourType.FullTime);
    }

    [Fact]
    public void HourType_WithBothHourlyAndPartTimeMarkers_ShouldPrioritizeHourly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson мз- з- Description"
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(HourType.Hourly);
    }

    [Fact]
    public void HourType_WithPartTimeButNotHourly_ShouldReturnPartTime()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson з- Description"
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(HourType.PartTime);
    }

    [Fact]
    public void HourType_WithNeitherMarker_ShouldReturnFullTime()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson Description"
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(HourType.FullTime);
    }

    [Fact]
    public void LessonType_WithMultipleTypeMarkers_ShouldReturnFirstMatch()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson (Лаб) (Л) Description"
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        result.Should().Be(LessonType.Laboratory);
    }

    [Fact]
    public void LessonType_WithComplexDescription_ShouldExtractCorrectType()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Системний аналіз інформаційних процесів (Л) ІС-22-1  1.А14.ауд. 03.03.2025 12:50-14:10"
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        result.Should().Be(LessonType.Lecture);
    }

    [Fact]
    public void HourType_WithComplexDescription_ShouldExtractCorrectType()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Системний аналіз інформаційних процесів (Л) ІС-22-1 мз-1.А14.ауд. 03.03.2025 12:50-14:10"
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(HourType.Hourly);
    }

    [Fact]
    public void Properties_CanBeModified_ShouldUpdateValues()
    {
        // Arrange
        var lesson = new Lesson
        {
            Object = "Initial Object",
            Date = "2025-01-15"
        };

        // Act
        lesson.Object = "Updated Object";
        lesson.Date = "2025-01-16";

        // Assert
        lesson.Object.Should().Be("Updated Object");
        lesson.Date.Should().Be("2025-01-16");
    }

    [Fact]
    public void ComputedProperties_ShouldUpdateWhenDescriptionChanges()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson (Л) Description"
        };

        // Act & Assert - Initial state
        lesson.LessonType.Should().Be(LessonType.Lecture);
        lesson.HourType.Should().Be(HourType.FullTime);

        // Act - Change description
        lesson.LessonDescription = "Test Lesson (Лаб) мз- Description";

        // Assert - Updated state
        lesson.LessonType.Should().Be(LessonType.Laboratory);
        lesson.HourType.Should().Be(HourType.Hourly);
    }

    [Fact]
    public void EdgeCase_WithVeryLongDescription_ShouldHandleCorrectly()
    {
        // Arrange
        var longDescription = new string('A', 10000) + "(Л)";
        var lesson = new Lesson
        {
            LessonDescription = longDescription
        };

        // Act
        var lessonType = lesson.LessonType;
        var hourType = lesson.HourType;

        // Assert
        lessonType.Should().Be(LessonType.Lecture);
        hourType.Should().Be(HourType.FullTime);
    }

    [Fact]
    public void EdgeCase_WithSpecialCharacters_ShouldHandleCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson (Л) !@#$%^&*()_+-=[]{}|;':\",./<>? Description"
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        result.Should().Be(LessonType.Lecture);
    }

    [Fact]
    public void EdgeCase_WithUnicodeCharacters_ShouldHandleCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Тест урок (Л) українською мовою"
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        result.Should().Be(LessonType.Lecture);
    }

    // NEW TESTS FOR ADDITIONAL PROPERTIES

    [Theory]
    [InlineData("півпара", true)]
    [InlineData("ПІВПАРА", true)]
    [InlineData("Test Lesson Description", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void HalfLesson_WithVariousDescriptions_ShouldReturnCorrectValue(string description, bool expected)
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = description
        };

        // Act
        var result = lesson.HalfLesson;

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("Увага! Заміна", true)]
    [InlineData("УВАГА! ЗАМІНА", true)]
    [InlineData("Test Lesson Description", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void Substitution_WithVariousDescriptions_ShouldReturnCorrectValue(string description, bool expected)
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = description
        };

        // Act
        var result = lesson.Substitution;

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("Увага! Заміна", 0)]
    [InlineData("півпара", 1)]
    [InlineData("Test Lesson Description", 2)]
    [InlineData("", 2)]
    [InlineData(null, 2)]
    public void LessonHours_WithVariousDescriptions_ShouldReturnCorrectValue(string description, int expected)
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = description
        };

        // Act
        var result = lesson.LessonHours;

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void LessonHours_WithSubstitutionAndHalfLesson_ShouldPrioritizeSubstitution()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Увага! Заміна півпара"
        };

        // Act
        var result = lesson.LessonHours;

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public void HalfLesson_WithCaseInsensitiveMatch_ShouldReturnTrue()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson ПІВПАРА Description"
        };

        // Act
        var result = lesson.HalfLesson;

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Substitution_WithCaseInsensitiveMatch_ShouldReturnTrue()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson УВАГА! ЗАМІНА Description"
        };

        // Act
        var result = lesson.Substitution;

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void HalfLesson_WithPartialMatch_ShouldReturnFalse()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson пів Description"
        };

        // Act
        var result = lesson.HalfLesson;

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Substitution_WithPartialMatch_ShouldReturnFalse()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson Заміна Description"
        };

        // Act
        var result = lesson.Substitution;

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void AllProperties_WithComplexRealWorldExample_ShouldWorkCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            Object = "Системний аналіз",
            Date = "03.03.2025",
            Comment = "Ауд. 1.А14",
            LessonNumber = "3",
            LessonName = "Системний аналіз інформаційних процесів",
            LessonTime = "12:50-14:10",
            LessonDescription = "Системний аналіз інформаційних процесів (Л) ІС-22-1 мз-1.А14.ауд. 03.03.2025 12:50-14:10"
        };

        // Act & Assert
        lesson.Object.Should().Be("Системний аналіз");
        lesson.Date.Should().Be("03.03.2025");
        lesson.Comment.Should().Be("Ауд. 1.А14");
        lesson.LessonNumber.Should().Be("3");
        lesson.LessonName.Should().Be("Системний аналіз інформаційних процесів");
        lesson.LessonTime.Should().Be("12:50-14:10");
        lesson.LessonDescription.Should().Be("Системний аналіз інформаційних процесів (Л) ІС-22-1 мз-1.А14.ауд. 03.03.2025 12:50-14:10");
        
        // Computed properties
        lesson.LessonType.Should().Be(LessonType.Lecture);
        lesson.HourType.Should().Be(HourType.Hourly);
        lesson.HalfLesson.Should().BeFalse();
        lesson.Substitution.Should().BeFalse();
        lesson.LessonHours.Should().Be(2);
    }

    [Fact]
    public void AllProperties_WithHalfLessonExample_ShouldWorkCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Теорія ймовірностей (Пр) півпара ІС-22-1"
        };

        // Act & Assert
        lesson.LessonType.Should().Be(LessonType.Practical);
        lesson.HourType.Should().Be(HourType.FullTime);
        lesson.HalfLesson.Should().BeTrue();
        lesson.Substitution.Should().BeFalse();
        lesson.LessonHours.Should().Be(1);
    }

    [Fact]
    public void AllProperties_WithSubstitutionExample_ShouldWorkCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Увага! Заміна: Математичний аналіз (Л) ІС-22-1"
        };

        // Act & Assert
        lesson.LessonType.Should().Be(LessonType.Lecture);
        lesson.HourType.Should().Be(HourType.FullTime);
        lesson.HalfLesson.Should().BeFalse();
        lesson.Substitution.Should().BeTrue();
        lesson.LessonHours.Should().Be(0);
    }

    [Fact]
    public void EdgeCase_WithVeryLongDescription_ShouldHandleAllPropertiesCorrectly()
    {
        // Arrange
        var longDescription = new string('A', 10000) + "(Л) півпара Увага! Заміна";
        var lesson = new Lesson
        {
            LessonDescription = longDescription
        };

        // Act
        var lessonType = lesson.LessonType;
        var hourType = lesson.HourType;
        var halfLesson = lesson.HalfLesson;
        var substitution = lesson.Substitution;
        var lessonHours = lesson.LessonHours;

        // Assert
        lessonType.Should().Be(LessonType.Lecture);
        hourType.Should().Be(HourType.FullTime);
        halfLesson.Should().BeTrue();
        substitution.Should().BeTrue();
        lessonHours.Should().Be(0); // Substitution takes priority
    }

    [Fact]
    public void EdgeCase_WithEmptyAndNullValues_ShouldHandleAllPropertiesCorrectly()
    {
        // Arrange
        var lesson = new Lesson();

        // Act & Assert
        lesson.LessonType.Should().Be(default(LessonType));
        lesson.HourType.Should().Be(HourType.FullTime);
        lesson.HalfLesson.Should().BeFalse();
        lesson.Substitution.Should().BeFalse();
        lesson.LessonHours.Should().Be(2);
    }

    [Fact]
    public void EdgeCase_WithWhitespaceOnly_ShouldHandleAllPropertiesCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "   "
        };

        // Act & Assert
        lesson.LessonType.Should().Be(default(LessonType));
        lesson.HourType.Should().Be(HourType.FullTime);
        lesson.HalfLesson.Should().BeFalse();
        lesson.Substitution.Should().BeFalse();
        lesson.LessonHours.Should().Be(2);
    }

    [Fact]
    public void EdgeCase_WithMixedCaseAndSpecialCharacters_ShouldHandleCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Тест урок (лаб) МЗ- з- півпара УВАГА! ЗАМІНА"
        };

        // Act & Assert
        lesson.LessonType.Should().Be(LessonType.Laboratory);
        lesson.HourType.Should().Be(HourType.Hourly);
        lesson.HalfLesson.Should().BeTrue();
        lesson.Substitution.Should().BeTrue();
        lesson.LessonHours.Should().Be(0); // Substitution takes priority
    }

    [Fact]
    public void EdgeCase_WithMultipleLessonTypes_ShouldReturnFirstMatch()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson (Л) (Лаб) (Пр) Description"
        };

        // Act
        var result = lesson.LessonType;

        // Assert
        // The LessonType property checks in this order: (Лаб), (Пр), (Зал), (КЕкз), (Екз), (Л)
        // So (Лаб) comes first and will be returned
        result.Should().Be(LessonType.Laboratory);
    }

    [Fact]
    public void EdgeCase_WithMultipleHourTypes_ShouldPrioritizeCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "Test Lesson з- мз- Description"
        };

        // Act
        var result = lesson.HourType;

        // Assert
        result.Should().Be(HourType.Hourly);
    }

    [Fact]
    public void EdgeCase_WithBoundaryValues_ShouldHandleCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "A" // Single character
        };

        // Act & Assert
        lesson.LessonType.Should().Be(default(LessonType));
        lesson.HourType.Should().Be(HourType.FullTime);
        lesson.HalfLesson.Should().BeFalse();
        lesson.Substitution.Should().BeFalse();
        lesson.LessonHours.Should().Be(2);
    }

    [Fact]
    public void EdgeCase_WithExactMatchStrings_ShouldHandleCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "(Л)" // Exact match for lecture
        };

        // Act & Assert
        lesson.LessonType.Should().Be(LessonType.Lecture);
        lesson.HourType.Should().Be(HourType.FullTime);
        lesson.HalfLesson.Should().BeFalse();
        lesson.Substitution.Should().BeFalse();
        lesson.LessonHours.Should().Be(2);
    }

    [Fact]
    public void EdgeCase_WithExactMatchHourType_ShouldHandleCorrectly()
    {
        // Arrange
        var lesson = new Lesson
        {
            LessonDescription = "мз-" // Exact match for hourly
        };

        // Act & Assert
        lesson.LessonType.Should().Be(default(LessonType));
        lesson.HourType.Should().Be(HourType.Hourly);
        lesson.HalfLesson.Should().BeFalse();
        lesson.Substitution.Should().BeFalse();
        lesson.LessonHours.Should().Be(2);
    }
}
