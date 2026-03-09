export const templates = {
  linkedin: [
    {
      id: "linkedin-1",
      title: "Product Launch",
      description: "Announce a new product or feature",
      example: "Excited to share that we've been working on something new. After months of development, we're finally ready to unveil our latest project. This has been an incredible journey and we can't wait for you to try it.",
      tone: "enthusiastic"
    },
    {
      id: "linkedin-2",
      title: "Industry Insight",
      description: "Share your perspective on industry trends",
      example: "I've been thinking a lot about where our industry is headed. Here are three trends I'm watching closely and why they matter for the future of our work.",
      tone: "professional"
    },
    {
      id: "linkedin-3",
      title: "Lessons Learned",
      description: "Share a failure or lesson from experience",
      example: "Last year, I made a mistake that cost us $50K. Here's what happened, what I learned, and how it made us stronger.",
      tone: "friendly"
    },
    {
      id: "linkedin-4",
      title: "Hot Take",
      description: "Share a controversial or bold opinion",
      example: "Unpopular opinion: Most companies are measuring the wrong metrics. Here's why vanity metrics are killing your growth and what to track instead.",
      tone: "assertive"
    },
    {
      id: "linkedin-5",
      title: "Team Recognition",
      description: "Celebrate your team's achievements",
      example: "I want to take a moment to recognize the incredible team behind our latest launch. None of this would be possible without their dedication and talent.",
      tone: "professional"
    }
  ],
  email: [
    {
      id: "email-1",
      title: "Follow-Up",
      description: "Gentle follow-up on a proposal or meeting",
      example: "I hope this message finds you well. I'm writing to follow up on our conversation from last week regarding the proposal. I'd love to hear your thoughts when you have a moment.",
      tone: "professional"
    },
    {
      id: "email-2",
      title: "Cold Outreach",
      description: "First contact with a potential client",
      example: "I came across your profile and was impressed by your work in [industry]. I believe we could help you achieve [specific goal]. Would you be open to a brief conversation next week?",
      tone: "friendly"
    },
    {
      id: "email-3",
      title: "Payment Reminder",
      description: "Professional but firm payment follow-up",
      example: "This is a friendly reminder that invoice #12345 is now 7 days overdue. Please arrange payment at your earliest convenience to avoid any disruption to your service.",
      tone: "assertive"
    },
    {
      id: "email-4",
      title: "Meeting Request",
      description: "Request a meeting with clear agenda",
      example: "I'd like to schedule 30 minutes next week to discuss [topic]. I have some ideas I'd love to share and get your feedback on. Would Tuesday or Wednesday work for you?",
      tone: "professional"
    },
    {
      id: "email-5",
      title: "Apology",
      description: "Sincere apology for a mistake",
      example: "I sincerely apologize for the delay in getting back to you. I understand this has caused inconvenience, and I'm committed to making this right. Here's what I'm doing to resolve this...",
      tone: "apologetic"
    }
  ],
  dating: [
    {
      id: "dating-1",
      title: "Comment on Profile",
      description: "Reference something from their profile",
      example: "I noticed you're into hiking - have you done the [local trail]? I've been meaning to check it out and would love recommendations!",
      tone: "friendly"
    },
    {
      id: "dating-2",
      title: "Ask About Photo",
      description: "Comment on a specific photo",
      example: "That photo from your trip to Japan looks amazing! What was the highlight of your trip? I've always wanted to visit.",
      tone: "enthusiastic"
    },
    {
      id: "dating-3",
      title: "Shared Interest",
      description: "Connect over a common interest",
      example: "Looks like we're both dog people! What's your dog's name? Mine is Max and he's convinced he's a lap dog despite being 80 pounds.",
      tone: "friendly"
    },
    {
      id: "dating-4",
      title: "Direct Approach",
      description: "Confident and straightforward",
      example: "Your profile caught my attention. You seem interesting and I'd love to get to know you better. Coffee this weekend?",
      tone: "assertive"
    },
    {
      id: "dating-5",
      title: "Question Opener",
      description: "Start with an engaging question",
      example: "Quick question: If you could have dinner with any three people, living or dead, who would they be? I'd love to hear your answer.",
      tone: "friendly"
    }
  ],
  complaint: [
    {
      id: "complaint-1",
      title: "Service Issue",
      description: "Professional complaint about poor service",
      example: "I am writing to express my disappointment with the service I received on [date]. Despite being a loyal customer for [time], the experience fell far below the standards I expect.",
      tone: "professional"
    },
    {
      id: "complaint-2",
      title: "Product Defect",
      description: "Report a faulty product",
      example: "I purchased [product] on [date] and it has already developed [issue]. This is unacceptable given the price point and your reputation. I expect a replacement or full refund.",
      tone: "assertive"
    },
    {
      id: "complaint-3",
      title: "Refund Request",
      description: "Request a refund politely but firmly",
      example: "I am requesting a full refund for [purchase]. The product did not meet the advertised specifications, and I have not been able to use it as intended. Please process this refund within 5 business days.",
      tone: "professional"
    },
    {
      id: "complaint-4",
      title: "Late Delivery",
      description: "Complaint about shipping delays",
      example: "My order #[number] was guaranteed delivery by [date]. It is now [current date] and I have not received my items nor any communication about the delay. This is unacceptable.",
      tone: "assertive"
    },
    {
      id: "complaint-5",
      title: "Billing Error",
      description: "Dispute incorrect charges",
      example: "I have noticed unauthorized charges on my account. My bill shows [incorrect amount] when it should be [correct amount]. Please correct this error and adjust my account accordingly.",
      tone: "professional"
    }
  ]
};

export type ToolType = keyof typeof templates;
export type Template = typeof templates.linkedin[0];
