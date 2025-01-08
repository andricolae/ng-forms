import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, of } from 'rxjs';

function mustContainQ(control: AbstractControl) {
  if (control.value.includes('?')) {
    return null;
  }
  return { doesNotContainQ: true};
}
function emailIsUnique(control: AbstractControl) {
  if (control.value !== 'test@example.com') {
    return of(null);
  }
  return of({notUnique: true});
}

let initialEmail = '';
const savedForm = window.localStorage.getItem('saved-email');

if (savedForm) {
  const loadedForm = JSON.parse(savedForm);
  initialEmail = loadedForm.email;
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    email: new FormControl(initialEmail, {
      validators: [ Validators.email, Validators.required ],
      asyncValidators: [emailIsUnique],
    }),
    password: new FormControl('', {
      validators: [ Validators.minLength(6), Validators.required, mustContainQ],
    }),
  });

  get emailInvalid() {
    return (this.form.controls.email.touched &&
      this.form.controls.email.invalid);
  }
  get passwordInvalid() {
    return (this.form.controls.password.touched &&
      this.form.controls.password.invalid);
  }

  ngOnInit() {
    // const savedForm = window.localStorage.getItem('saved-email');

    // if (savedForm) {
    //   const loadedForm = JSON.parse(savedForm);
    //   this.form.patchValue({
    //     email: loadedForm.email,
    //   });
    // }

    const subscription = this.form.valueChanges
      .pipe(debounceTime(500))
      .subscribe({
        next: value => {
          window.localStorage.setItem(
            'saved-email',
            JSON.stringify({email: value.email})
          );
        },
      });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onSubmit() {
    console.log(this.form);
  }
}
