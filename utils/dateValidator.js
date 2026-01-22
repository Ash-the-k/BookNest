export const validateDates = ({
  existingStartedDate,
  existingCompletedDate,
  newStartedDate,
  newCompletedDate
}) => {
  // Final values after update
  const finalStartedDate = newStartedDate ?? existingStartedDate;
  const finalCompletedDate = newCompletedDate ?? existingCompletedDate;

  // Rule: only validate if both exist
  if (finalStartedDate && finalCompletedDate) {
    const started = new Date(finalStartedDate);
    const completed = new Date(finalCompletedDate);

    if (completed < started) {
      throw new Error(
        "Completed date cannot be earlier than started date"
      );
    }
  }
};
