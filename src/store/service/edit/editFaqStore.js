import { create } from "zustand";

const initialFaqState = {
  question: "",
  answer: "",
};

const initialErrorsState = {
  field: "",
  message: "",
  active: false,
};

const useEditFaqStore = (set, get) => ({
  faq: [],
  newFaq: initialFaqState,
  editingFaq: initialFaqState,
  showNewFaqInputs: false,
  faqEditingMode: false,
  faqEditingInput: 0,
  errors: initialErrorsState,
  setNewFaq: (key, value) =>
    set((state) => ({
      newFaq: {
        ...state.newFaq,
        [key]: value,
      },
    })),
  setEditingFaq: (key, value) =>
    set((state) => ({
      editingFaq: {
        ...state.editingFaq,
        [key]: value,
      },
    })),

  editFaq: (index) =>
    set((state) => ({
      ...state,
      faqEditingMode: true,
      faqEditingInput: index,
      editingFaq: { ...state.faq[index] },
    })),

  handleShowNewFaqInputs: () =>
    set((state) => ({
      errors: initialErrorsState,
      showNewFaqInputs: !state.showNewFaqInputs,
    })),
  clearNewFaq: () =>
    set(() => ({
      newFaq: initialFaqState,
      showNewFaqInputs: false,
      errors: initialErrorsState,
    })),
  saveNewFaq: () =>
    set((state) => {
      const { newFaq, faq } = state;

      if (faq.length >= 5) {
        return {
          errors: {
            field: "addons",
            active: true,
            message: "Ο μέγιστος αριθμός ερωτήσεων είναι 5.",
          },
        };
      }

      // Validation checks
      if (newFaq.question.length === 0) {
        return {
          errors: {
            field: "faq-question",
            message: "Η ερώτηση είναι υποχρεωτική",
            active: true,
          },
        };
      }

      if (newFaq.question.length < 10) {
        return {
          errors: {
            field: "faq-question",
            message: "Η ερώτηση είναι μικρή",
            active: true,
          },
        };
      }

      if (newFaq.answer.length === 0) {
        return {
          errors: {
            field: "faq-answer",
            message: "Η απάντηση είναι υποχρεωτική",
            active: true,
          },
        };
      }

      if (newFaq.answer.length < 2) {
        return {
          errors: {
            field: "faq-answer",
            message: "Η απάντηση είναι μικρή",
            active: true,
          },
        };
      }

      // Update the Faqs list with the new Faq
      const updatedFaq = [...state.faq, newFaq];

      // Reset newFaq state
      return {
        errors: initialErrorsState,
        faq: updatedFaq,
        newFaq: initialFaqState,
        showNewFaqInputs: false,
      };
    }),
  deleteFaq: (index) =>
    set((state) => {
      const updatedFaq = [...state.faq];
      updatedFaq.splice(index, 1);
      return {
        faq: updatedFaq,
      };
    }),
  cancelEditingFaq: () =>
    set((state) => ({
      ...state,
      faqEditingMode: false,
      faqEditingInput: 0,
      editingFaq: initialFaqState,
    })),
  saveEditingFaq: () =>
    set((state) => {
      const { editingFaq, editingInput } = state;

      // Make a copy of the Faqs array
      const updatedFaq = [...state.faq];

      // Update the Faq at the editing index with the edited values
      updatedFaq[editingInput] = editingFaq;

      // Validation checks
      if (editingFaq.question.length === 0) {
        return {
          errors: {
            field: "editing-faq-question",
            message: "Η ερώτηση είναι υποχρεωτική",
            active: true,
          },
        };
      }

      if (editingFaq.question.length <= 5) {
        return {
          errors: {
            field: "editing-faq-question",
            message: "Η ερώτηση είναι μικρή",
            active: true,
          },
        };
      }

      if (editingFaq.answer.length === 0) {
        return {
          errors: {
            field: "editing-faq-answer",
            message: "Η απάντηση είναι υποχρεωτική",
            active: true,
          },
        };
      }

      if (editingFaq.answer.length <= 5) {
        return {
          errors: {
            field: "editing-faq-answer",
            message: "Η απάντηση είναι μικρή",
            active: true,
          },
        };
      }

      // Reset the editing state
      return {
        errors: initialErrorsState,
        faq: updatedFaq,
        editingFaq: initialFaqState,
        faqEditingInput: 0,
        faqEditingMode: false,
      };
    }),
});

export default useEditFaqStore;
