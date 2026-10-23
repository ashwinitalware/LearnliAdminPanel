import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Container, Engine } from '@tsparticles/engine'; // Updated imports
import { NgParticlesService } from '@tsparticles/angular';
import { loadFull } from 'tsparticles';
import { NgxParticlesModule } from "@tsparticles/angular";
import { FirebaseService } from '../../shared/services/firebase.service';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../../shared/services/auth.service';
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterModule, NgbModule, FormsModule, ReactiveFormsModule, AngularFireModule, SharedModule, NgxParticlesModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule, ToastrModule
  ],
  providers: [FirebaseService, { provide: ToastrService, useClass: ToastrService }],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],

})
export class LoginPage implements OnInit {
  disabled = '';
  active: any = "Angular";
  showLoader: boolean | undefined;
  id = "tsparticles";

  particlesOptions: any = {
    particles: {
      number: {
        value: 200,
        density: {
          enable: true,
          value_area: 400
        }
      },
      color: {
        value: '#28a9ff'
      },
      shape: {
        type: 'circle',
        stroke: {
          width: 0,
          color: '#ff0000'
        },
        polygon: {
          nb_sides: 5
        },
        image: {
          src: '',
          width: 100,
          height: 100
        }
      },
      opacity: {
        value: 0.5,
        random: false,
        anim: {
          enable: false,
          speed: 2,
          opacity_min: 0,
          sync: false
        }
      },
      size: {
        value: 1.5,
        random: false,
        anim: {
          enable: false,
          speed: 5,
          size_min: 0,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 100,
        color: '#fff',
        opacity: 1,
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: false,
          rotateX: 3000,
          rotateY: 3000
        }
      },
      array: []
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onHover: {
          enable: true,
          mode: 'grab'
        },
        onClick: {
          enable: true,
          mode: 'push'
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 100,
          line_linked: {
            opacity: 1
          }
        },
        bubble: {
          distance: 200,
          size: 80,
          duration: 0.4
        },
        repulse: {
          distance: 200,
          duration: 0.4
        },
        push: {
          particles_nb: 4
        },
        remove: {
          particles_nb: 2
        }
      },
      mouse: {}
    },
    retina_detect: false,
  };


  constructor(
    @Inject(DOCUMENT) private document: Document, private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    public authservice: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private firebaseService: FirebaseService,
    private toastr: ToastrService, private readonly ngParticlesService: NgParticlesService,
    private route: ActivatedRoute
  ) {
    // AngularFireModule.initializeApp(environment.firebase);

    const bodyElement = this.renderer.selectRootElement('body', true);
    //  this.renderer.setAttribute(bodyElement, 'class', 'cover1 justify-center');
  }
  firestoreModule: any;
  databaseModule: any;
  authModule: any;
  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'authentication-background');

    this.ngParticlesService.init(async (engine: Engine) => {
      await loadFull(engine); // Load core features (optional, depending on needs)
    });

    this.loginForm = this.formBuilder.group({
      username: ['admin@learnli.com', [Validators.required, Validators.email]],
      password: ['adminpassword', Validators.required],
    });

    this.route.queryParams.subscribe(params => {
      const emailParam = params['email'];
      if (emailParam) {
        this.loginForm.patchValue({
          username: emailParam,
          password: ''
        });
      }
    });

    this.firestoreModule = this.firebaseService.getFirestore();
    this.databaseModule = this.firebaseService.getDatabase();
    this.authModule = this.firebaseService.getAuth();

  }
  particlesLoaded(container: Container): void {
    console.log(container);
  }
  // firebase
  email = 'admin@learnli.com';
  password = 'adminpassword';
  errorMessage = ''; // validation _error handle
  _error: { name: string; message: string } = { name: '', message: '' }; // for firbase _error handle

  clearErrorMessage() {
    this.errorMessage = '';
    this._error = { name: '', message: '' };
  }

  login() {
    // console.log(this.loginForm)

    // this.disabled = "btn-loading"
    this.clearErrorMessage();
    if (this.validateForm(this.email, this.password)) {
      this.authservice
        .loginWithEmail(this.email, this.password)
        .then(() => {
          this.router.navigate(['/dashboards/dashboard']);
          console.clear();
          this.toastr.success('login successful', 'Learnli', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        })
        .catch((_error: any) => {
          this._error = _error;
          this.router.navigate(['/']);
        });

    }
    else {
      this.toastr.error('Invalid details', 'Learnli', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
  }

  validateForm(email: string, password: string) {
    if (email.length === 0) {
      this.errorMessage = 'please enter email id';
      return false;
    }

    if (password.length === 0) {
      this.errorMessage = 'please enter password';
      return false;
    }

    if (password.length < 6) {
      this.errorMessage = 'password should be at least 6 char';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  //angular
  public loginForm!: FormGroup;
  public error: any = '';

  get form() {
    return this.loginForm.controls;
  }

  Submit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.username;
      let password = this.loginForm.value.password;
      
      // If user inputs the frontend adminpassword password, map it to the backend's adminpassword
      if (email === 'admin@learnli.com' && password === 'adminpassword') {
        password = 'adminpassword';
      }

      this.authservice.adminLogin(email, password).subscribe({
        next: (res: any) => {
          const token = res.token || res.data?.token || (typeof res.data === 'string' ? res.data : null);
          if (res.success && token) {
            this.authservice.setToken(token);
            this.router.navigate(['/dashboards/dashboard']);
            this.toastr.success('Login successful', 'Learnli', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          } else {
            this.toastr.error(res.message || 'Invalid credentials', 'Learnli', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          }
        },
        error: (err: any) => {
          console.error('API login failed:', err);
          const errMsg = err.error?.message || err.message || 'Invalid details or server error';
          this.toastr.error(errMsg, 'Login Failed', {
            timeOut: 3500,
            positionClass: 'toast-top-right',
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    const bodyElement = this.renderer.selectRootElement('body', true);
    this.renderer.removeAttribute(bodyElement, 'class');
  }

  public showPassword: boolean = false;

  toggleClass = 'ri-eye-off-line';
  public togglePassword() {
    this.showPassword = !this.showPassword;
    if (this.toggleClass === 'ri-eye-line') {
      this.toggleClass = 'ri-eye-off-line';
    } else {
      this.toggleClass = 'ri-eye-line';
    }
  }
}
