export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Saving Tips' | 'Investment Guide' | 'Currency Updates' | 'Expense Tracking';
  date: string;
  readTime: number;
  image?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'track-daily-expenses',
    title: '5 Simple Ways to Track Your Daily Expenses',
    excerpt:
      'Master the art of expense tracking with these practical tips that will help you stay on top of your finances.',
    category: 'Expense Tracking',
    date: '2025-09-28',
    readTime: 5,
    image:
      'https://images.unsplash.com/photo-1658677414428-d0ae187034cc?q=80&w=1200&fit=crop', // 💰 Expense tracking, receipts, budgeting
    content: `
# 5 Simple Ways to Track Your Daily Expenses

Tracking your daily expenses is the foundation of good financial management. Here are five practical methods to help you stay on top of your spending.

## 1. Use a Digital Budget App

Apps like Kudimate make tracking effortless. Simply log each transaction as it happens, categorize it, and watch your spending patterns emerge. The convenience of having everything on your phone means you're more likely to stay consistent.

## 2. Keep All Your Receipts

Create a habit of collecting receipts for every purchase. At the end of each day or week, review them and log the expenses. This physical reminder helps you become more aware of your spending.

## 3. Set Daily Spending Limits

Decide on a reasonable daily budget for variable expenses like food, transport, and entertainment. This creates a clear boundary and helps prevent overspending.

## 4. Review Weekly Patterns

Look at your spending patterns weekly rather than monthly. This shorter timeframe makes it easier to identify problems and adjust your behavior before things get out of hand.

## 5. Categorize Everything

Break down your expenses into clear categories: food, transportation, utilities, entertainment, etc. This helps you see exactly where your money is going and makes it easier to identify areas where you can cut back.

## Conclusion

Consistency is key when tracking expenses. Start with whichever method feels most natural to you, and don't try to be perfect. The goal is progress, not perfection.
    `,
  },
  {
    id: '2',
    slug: 'cedi-usd-savings',
    title: 'Understanding CEDI vs USD: What It Means for Your Savings',
    excerpt:
      'Learn how currency fluctuations between the Ghana Cedi and US Dollar impact your savings and what you can do about it.',
    category: 'Currency Updates',
    date: '2025-09-25',
    readTime: 7,
    image:
      'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=1200&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8', // 💵 Currency and economy theme
    content: `
# Understanding CEDI vs USD: What It Means for Your Savings

Currency exchange rates play a crucial role in the value of your savings, especially in economies like Ghana where the Cedi fluctuates against major currencies like the US Dollar.

## Why Exchange Rates Matter

When the Cedi weakens against the Dollar, imported goods become more expensive. This affects everything from fuel prices to electronics, impacting your purchasing power even if you're paid in Cedis.

## Protecting Your Savings

### 1. Diversify Your Holdings

Don't keep all your savings in one currency. Consider maintaining some savings in a more stable currency if your circumstances allow it.

### 2. Invest in Real Assets

Property, land, and other tangible assets can serve as a hedge against currency depreciation. Their value often keeps pace with or exceeds inflation.

### 3. Monitor Economic Indicators

Stay informed about:
- Bank of Ghana interest rates
- Inflation reports
- Trade balance news
- Government fiscal policies

### 4. Time Your Major Purchases

If you need to buy imported goods or make foreign payments, timing matters. Watch exchange rate trends and make purchases when the Cedi is stronger.

## Practical Tips for Daily Life

- Buy local products when possible
- Build your emergency fund in stable assets
- Avoid keeping excess cash idle
- Consider treasury bills and bonds for better returns

## Long-Term Planning

For long-term goals like education or retirement, factor in currency risk. Work with financial advisors who understand the local economic context and can help you build a resilient financial plan.

## Conclusion

Understanding currency dynamics doesn't require an economics degree. Stay informed, diversify wisely, and focus on building assets that maintain value regardless of exchange rate fluctuations.
    `,
  },
  {
    id: '3',
    slug: 'first-emergency-fund',
    title: 'Building Your First Emergency Fund',
    excerpt:
      'A step-by-step guide to creating a financial safety net that will protect you from unexpected expenses.',
    category: 'Saving Tips',
    date: '2025-09-20',
    readTime: 6,
    image:
      'https://images.unsplash.com/photo-1633158829556-6ea20ad39b4f?q=80&w=1200&fit=crop', // 🏦 Savings jar / emergency fund concept
    content: `
# Building Your First Emergency Fund

An emergency fund is your financial safety net. It's money set aside specifically for unexpected expenses like medical bills, car repairs, or sudden job loss.

## Why You Need an Emergency Fund

Life is unpredictable. Without an emergency fund, you're one unexpected expense away from debt. This fund gives you:
- Peace of mind
- Financial stability
- Freedom to handle crises without stress
- Protection from high-interest debt

## How Much Should You Save?

### For Beginners
Start with ₵1,000 to ₵2,000. This covers most minor emergencies like:
- Minor car repairs
- Unexpected medical visits
- Small home repairs
- Emergency travel

### Intermediate Goal
Build up to 3 months of expenses. Calculate your monthly bills and multiply by three.

### Advanced Goal
Aim for 6-12 months of living expenses for maximum security.

## Step-by-Step Building Process

### 1. Start Small
Don't be intimidated by large goals. Begin with ₵50 or ₵100 per week. Small, consistent contributions add up faster than you think.

### 2. Automate Your Savings
Set up automatic transfers from your main account to a dedicated emergency fund account on payday. Out of sight, out of mind.

### 3. Use Windfalls Wisely
Tax refunds, bonuses, or gifts? Put at least 50% into your emergency fund.

### 4. Cut One Expense
Identify one non-essential expense you can eliminate temporarily. Redirect that money to your emergency fund.

### 5. Track Your Progress
Use Kudimate to monitor your emergency fund growth. Seeing progress motivates you to keep going.

## Where to Keep Your Emergency Fund

Your emergency fund should be:
- **Accessible**: Available within 24-48 hours
- **Safe**: Low-risk accounts like savings accounts
- **Separate**: Not mixed with your regular spending money

Consider:
- High-yield savings accounts
- Money market accounts
- Short-term treasury bills

Avoid:
- Long-term investments you can't easily access
- Risky investments that could lose value
- Your regular checking account (too tempting to spend)

## Common Mistakes to Avoid

### Using It for Non-Emergencies
A sale on new shoes is not an emergency. Be strict about what qualifies.

### Stopping After One Use
If you use your emergency fund, prioritize rebuilding it immediately.

### Keeping It in Cash at Home
Inflation erodes the value of physical cash, and it's not protected against theft.

### Waiting Until You Can Afford Large Amounts
Start now with whatever you can afford. ₵20 per week is better than nothing.

## Conclusion

Building an emergency fund takes discipline, but it's one of the most important financial moves you'll ever make. Start today, stay consistent, and watch your financial security grow.

Remember: The best time to build an emergency fund is before you need it.
    `,
  },
  {
    id: '4',
    slug: 'smart-investments-ghana',
    title: 'Smart Investment Options for Beginners in Ghana',
    excerpt:
      'Explore safe and profitable investment opportunities available to Ghanaians looking to grow their wealth.',
    category: 'Investment Guide',
    date: '2025-09-15',
    readTime: 8,
    image:
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200&fit=crop', // 📈 Investment, finance graph, Ghana wealth theme
    content: `
# Smart Investment Options for Beginners in Ghana

Ready to make your money work for you? Here's a practical guide to investment options available in Ghana, tailored for beginners.

...
    `,
  },
];

export const getBlogPost = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

export const getBlogPostsByCategory = (category: string): BlogPost[] => {
  return blogPosts.filter((post) => post.category === category);
};
