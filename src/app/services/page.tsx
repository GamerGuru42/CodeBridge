// src/app/services/page.tsx
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Link from 'next/link';
import {
  ArrowRight,
  Globe,
  ShoppingBag,
  Utensils,
  Home,
  Calendar,
  Layers,
  Layout,
  Users,
  Sliders,
  Cpu,
  RefreshCw,
  Wrench,
  Server
} from 'lucide-react';

export default function ServicesPage() {
  const allServices = [
    {
      id: 'business-websites',
      title: 'Business Websites',
      category: 'Websites & Brand',
      icon: Globe,
      desc: 'Modern, high-converting corporate and brand websites engineered for market credibility, client lead generation, and fast page loads.',
      features: ['Mobile-first responsive architecture', 'SEO-optimized schema & metadata', 'Lead capture & contact integrations', 'Corporate email & analytics integration']
    },
    {
      id: 'ecommerce',
      title: 'E-commerce Websites',
      category: 'Commerce',
      icon: ShoppingBag,
      desc: 'Scalable online storefronts with cart management, inventory tracking, promotional engines, and multi-currency checkout readiness.',
      features: ['Product variations & inventory tracking', 'Customer accounts & order history', 'Multi-currency (NGN & KES) modeling', 'Automated customer receipts & notifications']
    },
    {
      id: 'restaurant-ordering',
      title: 'Restaurant Websites & Ordering Systems',
      category: 'Hospitality',
      icon: Utensils,
      desc: 'Custom restaurant digital hubs with real-time digital menus, table reservation engines, and direct customer order workflows.',
      features: ['Digital QR & online menu catalog', 'Kitchen ticket order reception', 'Dine-in, takeaway & delivery options', 'WhatsApp & SMS notification webhooks']
    },
    {
      id: 'property-airbnb',
      title: 'Property & Airbnb Websites',
      category: 'Real Estate',
      icon: Home,
      desc: 'Direct booking and showcase platforms for real estate developers, short-let apartment operators, and property managers.',
      features: ['High-resolution virtual property tours', 'Calendar availability & nightly rates', 'Direct booking inquiry pipeline', 'iCal synchronization with Airbnb/Booking']
    },
    {
      id: 'booking-systems',
      title: 'Booking Systems',
      category: 'Applications',
      icon: Calendar,
      desc: 'Automated reservation, appointment scheduling, calendar integration, and client notification engines for service businesses.',
      features: ['Staff & service duration management', 'Google Calendar / Outlook sync', 'Automated client email/SMS reminders', 'Capacity & slot availability buffers']
    },
    {
      id: 'landing-pages',
      title: 'Landing Pages',
      category: 'Marketing',
      icon: Layout,
      desc: 'Precision-crafted single-page experiences optimized for paid ad campaigns, product launches, and maximum conversion velocity.',
      features: ['Sub-second page load performance', 'A/B conversion-focused layout hierarchy', 'Integrated CRM & lead webhook capture', 'Pixel tracking & analytics tags']
    },
    {
      id: 'web-applications',
      title: 'Custom Web Applications',
      category: 'Custom Software',
      icon: Layers,
      desc: 'Purpose-built software platforms engineered to streamline core business operations, automate data entry, and enable customer self-service.',
      features: ['Role-based access control (RBAC)', 'Complex transactional workflows', 'Relational database architecture', 'Robust REST API integrations']
    },
    {
      id: 'customer-portals',
      title: 'Customer Portals',
      category: 'Customer Experience',
      icon: Users,
      desc: 'Secure client-facing dashboards for document exchange, service ticketing, project status, invoicing, and account management.',
      features: ['End-to-end user authentication', 'Document uploads & download vault', 'Real-time project milestone tracker', 'Account billing & statement views']
    },
    {
      id: 'admin-dashboards',
      title: 'Admin Dashboards',
      category: 'Operational Tools',
      icon: Sliders,
      desc: 'Comprehensive executive control panels with operational metrics, user analytics, permission management, and audit trails.',
      features: ['Interactive operational analytics', 'Multi-level staff permission scopes', 'Exportable reporting (CSV/PDF)', 'System audit and security logging']
    },
    {
      id: 'custom-business-software',
      title: 'Custom Business Software',
      category: 'Enterprise',
      icon: Cpu,
      desc: 'Tailor-made software solutions built around proprietary company workflows and unique operational bottlenecks.',
      features: ['Custom business rule execution', 'Legacy software integration', 'Automated data transformation pipelines', 'High-concurrency database design']
    },
    {
      id: 'business-management-systems',
      title: 'Business Management Systems (ERP/CRM)',
      category: 'Enterprise',
      icon: Layers,
      desc: 'End-to-end digital operating systems integrating lead management, order lifecycle, resource planning, and internal communications.',
      features: ['Lead-to-Project pipeline tracking', 'Internal staff task assignment', 'Inventory & supplier tracking', 'Centralized client interaction history']
    },
    {
      id: 'website-redesigns',
      title: 'Website Redesigns',
      category: 'Modernization',
      icon: RefreshCw,
      desc: 'Complete architectural overhaul, performance upgrade, and visual modernization of legacy corporate websites.',
      features: ['Modern international tech aesthetic', 'Core Web Vitals speed optimization', 'Zero-downtime content migration', 'Clean typography & visual hierarchy']
    },
    {
      id: 'maintenance-support',
      title: 'Maintenance & Technical Support',
      category: 'Engineering SLA',
      icon: Wrench,
      desc: 'Ongoing code upkeep, security patches, uptime monitoring, bug fixes, and SLA-backed engineering support for business apps.',
      features: ['Proactive security patching', '24/7 uptime & health monitoring', 'Database backups & recovery plans', 'Guaranteed technical response times']
    },
    {
      id: 'hosting-domain-assistance',
      title: 'Hosting & Domain Assistance',
      category: 'Cloud Infrastructure',
      icon: Server,
      desc: 'High-availability cloud deployment, DNS configuration, SSL provisioning, and cloud infrastructure setup on resilient cloud providers.',
      features: ['Enterprise DNS & domain routing', 'Automated SSL/TLS certificates', 'Scalable cloud server configuration', 'Content Delivery Network (CDN) caching']
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ flex: 1, padding: '60px 0 90px' }}>
        <div className="cb-container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px' }}>
            <div className="cb-badge cb-badge-blue" style={{ marginBottom: '14px' }}>
              Full Engineering Catalog
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Digital Products & Technology Services
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
              CodeBridge provides 14 core digital product and engineering services designed to give modern businesses a decisive competitive advantage.
            </p>
          </div>

          <div className="cb-grid-2" style={{ gap: '28px' }}>
            {allServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} id={service.id} className="cb-card" style={{ display: 'flex', flexDirection: 'column', padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(30, 80, 255, 0.1)',
                      border: '1px solid rgba(30, 80, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--cb-blue-400)'
                    }}>
                      <Icon size={22} />
                    </div>
                    <span className="cb-badge cb-badge-neutral">{service.category}</span>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                    {service.title}
                  </h3>

                  <p style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                    {service.desc}
                  </p>

                  <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px',
                    flex: 1
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                      Key Deliverables & Capabilities
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--cb-text-secondary)' }}>
                      {service.features.map((f, fIdx) => (
                        <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--cb-blue-400)' }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={`/request-project?service=${service.id}`} className="cb-btn cb-btn-outline cb-btn-sm" style={{ alignSelf: 'flex-start', gap: '6px' }}>
                    Request Scoping for this Service <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: '60px',
            backgroundColor: 'var(--cb-navy-900)',
            borderRadius: '16px',
            border: '1px solid var(--cb-border-subtle)',
            padding: '40px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
              Need a Custom Solution Not Listed Here?
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--cb-text-secondary)', maxWidth: '600px', margin: '0 auto 24px' }}>
              We build custom business systems, automated integrations, and bespoke digital platforms tailored to your company's unique operational needs.
            </p>
            <Link href="/request-project" className="cb-btn cb-btn-primary">
              Discuss Your Custom Requirements <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
