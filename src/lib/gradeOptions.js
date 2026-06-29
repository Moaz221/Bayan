export const GRADE_OPTIONS = [
  { value: 1, label: 'أولى ثانوي' },
  { value: 2, label: 'ثانية ثانوي' },
  { value: 3, label: 'ثالثة ثانوي' },
];

export const getGradeLabel = (level) => {
  if (level === null || level === undefined) return '-';
  const grade = GRADE_OPTIONS.find((g) => g.value === Number(level));
  return grade?.label || '-';
};