# Contributing to sBTC Payment Gateway

Thank you for your interest in contributing to the sBTC Payment Gateway! This document provides guidelines for contributors, including hackathon judges and community members.

## 🏆 Hackathon Context

This project was built for the **Stacks Builders Challenge** with the goal of creating a Stripe-like payment gateway for sBTC. We welcome feedback, suggestions, and contributions from judges and the community.

## 🚀 Quick Start for Contributors

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stacks wallet for testing
- Basic knowledge of Next.js, TypeScript, and Stacks blockchain

### Setup Development Environment
\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/sbtc-payment-gateway.git
cd sbtc-payment-gateway

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
\`\`\`

## 📋 How to Contribute

### 🐛 Reporting Bugs
1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include steps to reproduce
4. Provide environment details
5. Add screenshots if applicable

### 💡 Suggesting Features
1. Check existing feature requests
2. Use the feature request template
3. Explain the use case and benefits
4. Consider implementation complexity
5. Discuss with maintainers first for major changes

### 🔧 Code Contributions

#### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

#### Commit Message Format
\`\`\`
type(scope): description

[optional body]

[optional footer]
\`\`\`

Examples:
- `feat(api): add payment intent creation endpoint`
- `fix(dashboard): resolve chart rendering issue`
- `docs(readme): update installation instructions`

#### Pull Request Process
1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Make** your changes with tests
4. **Ensure** all tests pass: `npm test`
5. **Update** documentation if needed
6. **Submit** a pull request with clear description

#### Code Standards
- **TypeScript**: Use strict typing
- **ESLint**: Follow configured rules
- **Prettier**: Format code consistently
- **Tests**: Add tests for new features
- **Comments**: Document complex logic

## 🧪 Testing Guidelines

### Running Tests
\`\`\`bash
npm test                 # Unit tests
npm run test:e2e        # End-to-end tests
npm run test:contract   # Smart contract tests
npm run test:coverage   # Coverage report
\`\`\`

### Test Requirements
- **Unit Tests**: All new functions and components
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user flows
- **Contract Tests**: Smart contract functions

### Test Structure
\`\`\`typescript
describe('PaymentIntent', () => {
  it('should create payment intent successfully', async () => {
    // Arrange
    const paymentData = { amount: 1000, currency: 'sbtc' };
    
    // Act
    const result = await createPaymentIntent(paymentData);
    
    // Assert
    expect(result.status).toBe('pending');
    expect(result.amount).toBe(1000);
  });
});
\`\`\`

## 📁 Project Structure

\`\`\`
sbtc-payment-gateway/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Merchant dashboard
│   ├── docs/             # Documentation pages
│   └── examples/         # Code examples
├── components/           # React components
│   ├── dashboard/       # Dashboard components
│   └── ui/              # Reusable UI components
├── contracts/           # Clarity smart contracts
├── lib/                # Utilities and configurations
├── scripts/            # Database and deployment scripts
├── tests/              # Test files
└── docs/               # Additional documentation
\`\`\`

## 🎯 Areas for Contribution

### High Priority
- **Security Audits**: Review smart contract and API security
- **Performance Optimization**: Improve loading times and responsiveness
- **Mobile Experience**: Enhance mobile wallet integration
- **Documentation**: Improve developer guides and examples

### Medium Priority
- **Additional Wallets**: Support for more Stacks wallets
- **Analytics Enhancement**: More detailed merchant insights
- **Internationalization**: Multi-language support
- **Accessibility**: WCAG compliance improvements

### Low Priority
- **UI/UX Polish**: Design improvements and animations
- **Additional Examples**: More framework integrations
- **Developer Tools**: CLI tools and debugging utilities
- **Community Features**: Forums, support chat

## 🔍 Code Review Guidelines

### For Reviewers
- **Functionality**: Does the code work as intended?
- **Security**: Are there any security vulnerabilities?
- **Performance**: Is the code efficient?
- **Maintainability**: Is the code readable and well-structured?
- **Tests**: Are there adequate tests?
- **Documentation**: Is the code properly documented?

### Review Checklist
- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Documentation updated
- [ ] Breaking changes noted

## 🏆 Hackathon Judge Guidelines

### Evaluation Criteria
1. **Technical Innovation**: Novel use of Stacks/sBTC features
2. **Developer Experience**: Ease of integration and use
3. **Code Quality**: Clean, maintainable, well-tested code
4. **Documentation**: Comprehensive guides and examples
5. **Production Readiness**: Security, performance, scalability

### Testing the Application
1. **Clone and Setup**: Follow README instructions
2. **Create Payment**: Test payment intent creation
3. **Complete Transaction**: Use test wallet to pay
4. **Verify Webhooks**: Check event delivery
5. **Explore Dashboard**: Review merchant features
6. **Check Documentation**: Evaluate developer resources

### Providing Feedback
- Use GitHub Issues for bugs and suggestions
- Comment on specific code sections in PRs
- Provide constructive feedback with examples
- Suggest improvements with rationale
- Highlight innovative features and approaches

## 📞 Getting Help

### Community Support
- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time chat with maintainers
- **Email**: Direct contact for sensitive issues

### Documentation
- **README.md**: Project overview and setup
- **API Docs**: `/docs/api-reference`
- **SDK Guide**: `/docs/sdk`
- **Examples**: `/examples`

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Hackathon submission acknowledgments
- Community showcases

---

**Thank you for contributing to the future of Bitcoin payments on Stacks!**
