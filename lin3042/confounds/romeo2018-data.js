/* Open data of Romeo, R. R., Leonard, J. A., Robinson, S. T., West, M. R., Mackey, A. P.,
   Rowe, M. L., & Gabrieli, J. D. E. (2018). Beyond the 30-million-word gap: Children's
   conversational exposure is associated with language-related brain function. Psychological
   Science, 29(5), 700-710. https://doi.org/10.1177/0956797617742725
   Source: Harvard Dataverse, https://doi.org/10.7910/DVN/DIDBMQ, file
   Behavioral_and_fMRI_data.csv (dataset version 5), released under CC0 1.0.
   Downloaded 5 November 2026. Ten of its sixteen columns, renamed, in the file's row order (36
   children); subject IDs, sex, grade, task order and the executive-function scores are left out.
     age        Age (years)
     edu        Parent_Education (parents' average, 1 = high school or less ... 5)
     income     Family_Income (US dollars per year)
     adultWords Peak_Adult_Words (adult words in the peak hour)
     turns      Peak_Coversational_Turns [sic] (conversational turns in the peak hour)
     childUtt   Peak_Child_Utterances (child utterances in the peak hour)
     nonverbal  Nonverbal_Composite
     verbal     Verbal_Composite
     broca      Mean_ROI_activation (Broca's area: pars opercularis + pars triangularis,
                anatomically defined, forward > backward speech; paper p. 707)
     verbalSES  Verbal_Composite_Controlling_for_SES (the y-axis of the paper's Fig. 3) */
window.ROMEO2018 = {
  age: [6.02, 5.95, 5.2, 5.41, 4.55, 6.17, 6.03, 6.19, 5.92, 6.26, 6.31, 5.72, 6.43, 5.77, 5.48, 6.21, 5.73, 5.75, 6.1, 5.94, 4.53, 5.62, 6.27, 4.56, 6.37, 5.35, 4.51, 6.55, 5.13, 6.28, 6.52, 5.5, 6.82, 6.5, 6.5, 6.55],
  edu: [5, 4, 4, 2, 2, 3, 2, 3.5, 2, 1, 3, 1, 1, 3, 3.5, 2, 1, 1, 1, 4, 1, 4, 2, 4.5, 3.5, 5, 5, 5, 2.5, 4.5, 4.5, 4.5, 4.5, 3.5, 3.5, 4],
  income: [200000, 54000, 200000, 42000, 80000, 130000, 86000, 130000, 100000, 85000, 50000, 40000, 10000, 150000, 85000, 47000, 23000, 9132, 56000, 160000, 13000, 125000, 6000, 50000, 75000, 150000, 230000, 230000, 65000, 60000, 250000, 250000, 200000, 140000, 140000, 180000],
  adultWords: [5761, 4775, 3861, 4558, 5732, 3295, 4513, 4502, 2841, 2964, 3678, 4209, 2858, 5581, 5918, 2825, 3662, 5577, 1953, 5948, 3378, 6991, 4403, 4278, 2490, 4374, 4483, 3956, 2177, 3794, 5995, 5880, 4855, 3665, 3143, 4503],
  turns: [186, 230, 294, 127, 166, 182, 198, 171, 277, 91, 215, 116, 128, 86, 207, 253, 137, 151, 129, 213, 209, 266, 111, 142, 142, 158, 147, 228, 210, 172, 317, 219, 141, 147, 161, 197],
  childUtt: [545, 1045, 1037, 608, 751, 653, 658, 300, 1164, 459, 708, 345, 686, 492, 866, 908, 576, 634, 957, 487, 777, 1173, 444, 1093, 437, 590, 542, 1051, 755, 702, 1130, 1275, 698, 452, 1027, 719],
  nonverbal: [14.7, 11.7, 11.7, 12, 8.3, 9, 8, 8.3, 12.7, 7.3, 12.3, 10, 9, 7.7, 13.3, 11.7, 10.3, 11.3, 7.3, 14.3, 10, 10, 8.7, 9, 13.7, 13, 10, 11, 12, 10, 9, 7.7, 13.7, 12.3, 11, 11],
  verbal: [134.5, 139, 123, 90, 109, 104, 93, 101.5, 111, 101, 98.5, 102, 92.5, 102.5, 130, 133, 101, 110, 85.5, 125, 103, 131.5, 89, 115, 127, 129.5, 122, 107, 120.5, 125.5, 130.5, 127.5, 125.5, 116, 117, 126],
  broca: [32.17, 4.32, 22.56, -43.5, 13.96, 2.83, -49.44, -43.09, 16.39, -7.78, -35.53, -25.12, -14.23, -52.54, -0.26, 9.51, 3.84, 7.99, -19.42, 59.42, 42.02, 50.81, -29.97, 24.3, 42.39, -0.75, -0.3, 11.15, 20.66, 6.78, 43.29, 39.47, -26.22, 6.05, -5.59, -20.14],
  verbalSES: [0.6, 1.48, 0.3, -1.48, 0.31, -0.8, -1.13, -1.4, 0.52, 0.34, -1.44, 0.35, -0.57, -0.9, 1.1, 2.41, 0.22, 1.01, -1.12, 0.41, 0.39, 0.93, -1.64, -1.07, 0.81, 0.05, -0.48, -1.83, 0.95, -0.1, 0.7, 0.43, 0.16, -0.07, 0.02, 0.54]
};
