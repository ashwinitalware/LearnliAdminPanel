import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './privacy-policy.html',
  styleUrls: ['./privacy-policy.scss']
})
export class PrivacyPolicyComponent {
  lastUpdated = 'September 21, 2026';
  appName = 'Learnli';
  supportEmail = 'support@learnli.online';
  privacyEmail = 'privacy@learnli.online';
  websiteUrl = 'https://learnli.online';

  printPage() {
    window.print();
  }

  scrollToSection(id: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
