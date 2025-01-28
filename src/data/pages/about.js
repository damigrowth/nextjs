export const data = {
  breadcrumb: {
    title: "Σχετικά με τη Doulitsa",
    description:
      "Χαλάρωσε, εδώ θα βρεις τους κατάλληλους επαγγελματίες για να κάνουν τη Doulitsa που θέλεις.",
  },
  about: {
    heading: "Έλα και εσύ στην καλύτερη πλατφόρμα Επαγγελματιών",
    description:
      "Έλα και εσύ στη Doulitsa, την πλατφόρμα που επαναπροσδιορίζει τη σύνδεση επαγγελματιών με πελάτες. Από την πρώτη στιγμή απολαμβάνεις ευκολία, ασφάλεια και άμεση πρόσβαση σε κορυφαίους επαγγελματίες. Ανακάλυψε την επόμενη συνεργασία σου, με διαφάνεια, αξιοπιστία και σιγουριά. Η Doulitsa φέρνει νέες ευκαιρίες στην πόρτα σου!",
    image: "/images/about/about-page-image-1.png",
    list: [
      "Βρες ικανούς επαγγελματίες, άμεσα και αξιόπιστα.",
      "Ανακάλυψε υπηρεσίες με κορυφαίες αξιολογήσεις και ειδικές προσφορές!",
      "Μπες στην πιο εξελιγμένη κοινότητα επαγγελματιών και χρηστών.",
    ],
    button: {
      text: "Βρες Υπηρεσίες",
      link: "/categories",
    },
  },
  counter: {
    data: [
      {
        end: 400,
        label: "Υπηρεσίες",
        text: "+",
      },
      {
        end: 180,
        label: "Κατηγορίες Υπηρεσιών",
        text: "+",
      },
      {
        end: 150,
        label: "Εππαγελματικά Προφίλ",
        text: "+",
      },
      {
        end: 100,
        label: "Θετικές Αξιολογήσεις",
        text: "+",
      },
    ],
  },
  cta1: {
    title: "Είσαι έτοιμος για την επόμενη μεγάλη συνεργασία σου;",
    subtitle: "",
    image: "/images/about/about-page-image-2.png",
    alt: "alt-image",
    lists: [
      {
        title: "Ξεχώρισε τους κορυφαίους",
        desc: "Σύγκρινε και εντόπισε τα επαγγελματικά προφίλ που συγκεντρώνουν τις καλύτερες αξιολογήσεις.",
        icon: "flaticon-badge",
      },
      {
        title: "Χωρίς κρυφά κόστη",
        desc: "Δεν υπάρχουν κρυφές χρεώσεις ή προμήθειες. Πληρώνεις στους επαγγελματίες το ποσό της προσφοράς τους.",
        icon: "flaticon-money",
      },
      {
        title: "Ασφάλεια και Πιστοποίηση",
        desc: "Θεωρούμε την ασφάλεια ως τον πιο σημαντικό παράγοντα, για αυτό πιστοποιούμε τα επαγγελματικά προφίλ για να έχεις το κεφάλι σου ήσυχο.",
        icon: "flaticon-security",
      },
    ],
  },

  funFact: {
    leftSection: {
      title: "Μπες στην πιο εξελιγμένη κοινότητα επαγγελματιών και χρηστών.",
      description:
        "Εντόπισε τα ταλέντα και διάλεξε μια υπηρεσία που είναι Value for Money.",
      buttonText: "Ξεκίνα τώρα",
      buttonLink: "/register",
    },
    rightSection: {
      facts: [
        {
          value: "4.9",
          label: "Εντόπισε τα καλύτερα προφίλ",
          suffix: "/5",
        },
        {
          value: "98",
          label:
            "Από τους χρήστες δήλωσαν ότι θα ξαναχρησιμοποιήσουν τη Doulitsa",
          suffix: "%",
        },
        {
          value: "8/10",
          label: "Επέλεξαν κάποιο Πιστοποιημένο Προφίλ",
          suffix: "",
        },
      ],
    },
    images: {
      leftTop: "/images/vector-img/left-top.png",
      rightBottom: "/images/vector-img/right-bottom.png",
    },
  },
  testimonials: {
    title: "Είπαν για εμάς",
    subtitle:
      "Αν θέλετε να μπείτε εδώ, στείλτε μας τα σχόλια σας για την πλατφόρμα με email.",

    testimonials: [
      {
        id: "pills-home",
        title: "Σας συστήνω ανεπιφύλακτα",
        text: "“Η επιχείρηση μου είναι μια μικρή ξενοδοχειακή μονάδα. Η Doulitsa με βοηθάει να βρω επαγγελματίες που δεν μπορούσα να προσλάβω σε μόνιμη θέση.”",
        author: {
          name: "Δημήτρης Κ.",
          category: "Ξενοδόχος",
          image: "/images/testimonials/1.jpg",
        },
      },
      {
        id: "pills-profile",
        title: "Πολύ καλή δουλειά",
        text: "“Βρήκα γρήγορα έναν επαγγελματία designer για να μου σχεδιάσει ένα καινούργιο logo.”",
        author: {
          name: "Manolis S.",
          category: "Επιχειρηματίας",
          image: "/images/testimonials/2.jpg",
        },
        active: true,
      },
      {
        id: "pills-contact",
        title: "Είμαι πολύ ικανοποιημένος",
        text: "“Μέσα από την πλατφόρμα μπόρεσα να παρουσιάσω όλη τη δουλειά μου και να βρω νέους πελάτες, αλλά και συνεργάτες.”",
        author: {
          name: "Courtney Henry",
          category: "Web Developer",
          image: "/images/testimonials/3.jpg",
        },
      },
    ],
  },
  cta2: {
    image: "/images/about/about-page-image-3.png",
    title: "Ψάχνεις για κάποια Υπηρεσία;",
    subtitle: "Ξεκίνα την αναζήτηση και κάνε Doulitsa 😉",
    boxes: [
      {
        icon: "flaticon-cv",
        title: "Βρες τον καλύτερο",
        description:
          "Δες τις αξιολογήσεις και εντόπισε το καλύτερο επαγγελματικό προφίλ για αυτό που ψάχνεις.",
      },
      {
        icon: "flaticon-web-design",
        title: "Επιλέξτε τη συνεργασία σας",
        description:
          "Επικοινώνησε με τον επαγγελματία για να σε ενημερώσει πως θα προχωρήσετε.",
      },
      {
        icon: "flaticon-secure",
        title: "Μείνε Ασφαλής",
        description:
          "Προτίμησε τα Πιστοποιημένα Προφίλ που έχουν διασταυρωθεί ότι υπάρχουν πραγματικά.",
      },
    ],
  },

  faq: {
    title: "Συχνές Ερωτήσεις",
    subtitle: "Αν έχεις περισσότερες ερωτήσεις πήγαινε στη σελίδα",
    questions: [
      {
        id: "One",
        question: "Που έχει έδρα η Doulitsa;",
        answer: "Είμαστε Ελληνική εταιρεία και έχουμε την έδρα μας στην Αθήνα.",
        isOpen: true,
      },
      {
        id: "Two",
        question:
          "Πώς μπορώ να συνεργαστώ με την Doulitsa αν είμαι επαγγελματίας;",
        answer:
          "Για να εγγραφείς ως επαγγελματίας και να προσφέρεις τις υπηρεσίες σου, ακολούθησε τις οδηγίες στη σελίδα 'Εγγραφή'. Θα είμαστε σε επικοινωνία για να σε βοηθήσουμε σε ό,τι χρειαστείς.",
        isOpen: false,
      },
      {
        id: "Three",
        question: "Υπάρχουν κρυφές χρεώσεις;",
        answer:
          "Η εγγραφή στον κατάλογό μας είναι εντελώς Δωρεάν. Εάν έχετε επαγγελματικό προφίλ μπορείτε να αποκτήσετε μια συνδρομή για να αυξήσετε την προβολή σας. Από την πλευρά των χρηστών, δεν υπάρχει καμία επιβάρυνση για να αποκτήσετε οποιαδήποτε υπηρεσία.",
        isOpen: false,
      },
    ],
  },

  pricing: {
    title: "Membership Plans",
    subtitle:
      "Give your visitor a smooth online experience with a solid UX design",
    billingOptions: {
      monthly: "Billed Monthly",
      yearly: "Billed Yearly",
      saveText: "Save 20%",
    },
    plans: [
      {
        id: 1,
        plan: "Basic Plan",
        monthlyPrice: 29,
        yearlyPrice: 299,
        description: "Perfect for individuals and small projects.",
        features: [
          "1 Listing",
          "30 Days Visibility",
          "Highlighted in Search Results",
          "4 Revisions",
          "9 days Delivery Time",
          "Basic Support",
        ],
        isActive: false,
      },
      {
        id: 2,
        plan: "Standard Plan",
        monthlyPrice: 49,
        yearlyPrice: 499,
        description: "Ideal for growing businesses and teams.",
        features: [
          "5 Listings",
          "60 Days Visibility",
          "Highlighted in Search Results",
          "8 Revisions",
          "7 days Delivery Time",
          "Priority Support",
        ],
        isActive: true,
      },
      {
        id: 3,
        plan: "Premium Plan",
        monthlyPrice: 89,
        yearlyPrice: 899,
        description: "Advanced features for larger organizations.",
        features: [
          "15 Listings",
          "90 Days Visibility",
          "Featured in Search Results",
          "Unlimited Revisions",
          "5 days Delivery Time",
          "24/7 Premium Support",
        ],
        isActive: false,
      },
      {
        id: 4,
        plan: "Enterprise Plan",
        monthlyPrice: 129,
        yearlyPrice: 1299,
        description: "Customized solutions for large-scale operations.",
        features: [
          "Unlimited Listings",
          "Unlimited Visibility",
          "Featured and Promoted in Search",
          "Unlimited Revisions",
          "3 days Delivery Time",
          "Dedicated Account Manager",
        ],
        isActive: false,
      },
    ],
  },
};
