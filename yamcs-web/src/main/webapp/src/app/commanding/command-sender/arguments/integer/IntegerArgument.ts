import { ChangeDetectionStrategy, Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, UntypedFormControl, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ArgumentType } from '../../../../client';
import { requireInteger, requireUnsigned } from '../../../../shared/forms/validators';
import { unflattenIndex } from '../../../../shared/utils';

@Component({
  selector: 'app-integer-argument',
  templateUrl: './IntegerArgument.html',
  styleUrls: ['../arguments.css', './IntegerArgument.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IntegerArgument),
    multi: true,
  }, {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => IntegerArgument),
    multi: true,
  }],
})
export class IntegerArgument implements ControlValueAccessor, OnInit, Validator, OnDestroy {

  @Input()
  name: string;

  @Input()
  description?: string;

  @Input()
  type: ArgumentType;

  @Input()
  index?: number;

  @Input()
  dimensions?: number[];

  formControl = new UntypedFormControl();

  controlName: string;

  private validators: ValidatorFn[] = [];
  private onChange = (_: string | null) => { };
  private subscriptions: Subscription[] = [];

  hexToggle$ = new BehaviorSubject<boolean>(false);

  ngOnInit() {
    this.subscriptions.push(
      this.formControl.valueChanges.subscribe(() => {
        let value = this.formControl.value;
        if (value !== null && this.hexToggle$.value) {
          value = String(value);
        }
        this.onChange(value);
      })
    );

    if (this.index === undefined) {
      this.controlName = this.name;
    } else {
      this.controlName = String(this.index);
    }

    this.validators.push(Validators.required);
    this.validators.push(requireInteger);
    if (this.type.signed === false) {
      this.validators.push(requireUnsigned);
    }
    if (this.type.rangeMax !== undefined) {
      this.validators.push(Validators.max(this.type.rangeMax));
    }
    if (this.type.rangeMin !== undefined) {
      this.validators.push(Validators.min(this.type.rangeMin));
    }
  }

  get label() {
    if (this.index !== undefined) {
      const index = unflattenIndex(this.index, this.dimensions!);
      return index.map(i => '[' + i + ']').join('');
    } else {
      return this.name;
    }
  }

  writeValue(obj: any) {
    this.formControl.setValue(obj);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
  }

  setDisabledState?(isDisabled: boolean) {
  }

  validate(control: UntypedFormControl): ValidationErrors | null {
    for (const validator of this.validators) {
      const errors = validator(control);
      if (errors) {
        return errors;
      }
    }
    return null;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
