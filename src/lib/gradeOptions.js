export const GRADE_OPTIONS = [
  { label: 'الصف الأول الثانوي', value: '1' },
  { label: 'الصف الثاني الثانوي', value: '2' },
  { label: 'الصف الثالث الثانوي', value: '3' },
];

export const getGradeLabel = (value) => {
  const found = GRADE_OPTIONS.find((item) => item.value === String(value));
  return found ? found.label : 'غير محدد';
};
