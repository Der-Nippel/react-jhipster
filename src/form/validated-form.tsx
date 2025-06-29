/*
 Copyright 2017-2025 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { ReactElement, useEffect, useState } from 'react';
import {
  DefaultValues,
  FieldError,
  FieldValues,
  RegisterOptions,
  SubmitHandler,
  useForm,
  UseFormRegister,
  UseFormSetValue,
  ValidationMode,
} from 'react-hook-form';
import {
  Button,
  Col,
  Form,
  FormGroup,
  FormControl,
  Row,
  FormLabel,
} from 'react-bootstrap';

import { byteSize, isEmpty, openFile, setFileData } from '../util';

export interface ValidatedFormProps {
  children: React.ReactNode;
  onSubmit: SubmitHandler<FieldValues>;
  defaultValues?: DefaultValues<FieldValues>;
  mode?: keyof ValidationMode;
  [key: string]: any;
}

/**
 * A wrapper for simple validated forms using React-Bootstrap Form and React-hook-form.
 */
export function ValidatedForm({ defaultValues, children, onSubmit, mode, ...rest }: ValidatedFormProps): React.JSX.Element {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, touchedFields, dirtyFields },
  } = useForm({ mode: mode || 'onTouched', defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} {...rest}>
      {React.Children.map(children, (child: ReactElement) => {
        const props: any = child?.props;
        const type = child?.type as any;
        const isValidated = type && props?.name && ['ValidatedField', 'ValidatedInput', 'ValidatedBlobField'].includes(type.displayName);

        if (isValidated) {
          const childName = props.name;
          const elem = {
            ...props,
            register: typeof props.register !== 'undefined' ? props.register : register,
            error: typeof props.error !== 'undefined' ? props.error : errors[childName],
            isTouched: typeof props.isTouched !== 'undefined' ? props.isTouched : touchedFields[childName],
            isDirty: typeof props.isDirty !== 'undefined' ? props.isDirty : dirtyFields[childName],
            validate: typeof props.validate !== 'undefined' ? props.validate : undefined,
            key: childName,
          };
          if (type.displayName === 'ValidatedBlobField') {
            const defaultValue = defaultValues?.[childName];
            const defaultContentType = defaultValues?.[`${childName}ContentType`];
            elem.setValue = typeof props.setValue === 'undefined' ? setValue : props.setValue;
            elem.defaultValue = typeof props.defaultValue === 'undefined' ? defaultValue : props.defaultValue;
            elem.defaultContentType = typeof props.defaultContentType === 'undefined' ? defaultContentType : props.defaultContentType;
          }
          return React.createElement(type, { ...elem });
        }
        return child;
      })}
    </Form>
  );
}

ValidatedForm.displayName = 'ValidatedForm';

export interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  register?: UseFormRegister<FieldValues> | undefined;
  error?: FieldError | undefined;
  isTouched?: boolean | undefined;
  isDirty?: boolean | undefined;
  validate?: RegisterOptions | undefined;
  value?: any;
  tag?: any;
  defaultValue?: string | number | string[];
}

export interface ValidatedFieldProps extends ValidatedInputProps {
  label?: string;
  labelClass?: string;
  labelHidden?: boolean;
  row?: boolean;
  col?: any;
  tag?: any;
  check?: boolean;
  inputClass?: string;
  rows?: number;
  inputTag?: React.ElementType;
}

/**
 * A utility wrapper over React-Bootstrap FormControl component that uses react-hook-form data to show error message and error/validated styles.
 */
export function ValidatedInput({
  name,
  id = name,
  register,
  error,
  isTouched,
  isDirty,
  validate,
  children,
  tag,
  className,
  onChange,
  onBlur,
  size,
  ...attributes
}: ValidatedInputProps): React.JSX.Element {

  className = className || '';
  className = isTouched ? `${className} is-touched` : className;
  className = isDirty ? `${className} is-dirty` : className;
  const s = size === 1 ? "sm" : "lg";

  if (!register) {
    return (
      <FormControl
        name={name}
        id={id}
        className={className}
        onChange={onChange}
        onBlur={onBlur}
        size={s}
        {...attributes}
      >
        {children}
      </FormControl>
    );
  }

  // Register from react-hook-form expects HTMLInputElement, but FormControl can be textarea/select
  const { name: registeredName, onBlur: onBlurValidate, onChange: onChangeValidate, ref } = register(name, validate);

  const handleChange = (e: React.ChangeEvent<any>) => {
    if (onChangeValidate) void onChangeValidate(e as any);
    if (onChange) onChange(e);
  };
  const handleBlur = (e: React.FocusEvent<any>) => {
    if (onBlurValidate) void onBlurValidate(e as any);
    if (onBlur) onBlur(e);
  };

  return (
    <>
      <FormControl
        name={registeredName}
        id={id}
        isValid={!!isTouched && !error}
        isInvalid={!!error}
        ref={ref}
        className={className}
        onChange={handleChange}
        onBlur={handleBlur}
        size={s}
        {...attributes}
      >
        {children}
      </FormControl>
      {error && <FormControl.Feedback type="invalid">{error.message}</FormControl.Feedback>}
    </>
  );
}

ValidatedInput.displayName = 'ValidatedInput';

/**
 * A utility wrapper over React-Bootstrap FormGroup + FormLabel + ValidatedInput.
 */
export function ValidatedField({
  children,
  name,
  id,
  disabled,
  className,
  check,
  row,
  col,
  tag,
  label,
  labelClass,
  labelHidden,
  inputClass,
  inputTag,
  hidden,
  ...attributes
}: ValidatedFieldProps): React.JSX.Element {
  const input = (
    <ValidatedInput
      name={name}
      id={id}
      disabled={disabled}
      className={inputClass}
      hidden={hidden}
      tag={inputTag}
      {...attributes}
    >
      {children}
    </ValidatedInput>
  );

  const inputRow = row ? <Col {...col}>{input}</Col> : input;
  return (
    <FormGroup as={tag} className={className} hidden={hidden}>
      {check && inputRow}
      {label && (
        <FormLabel id={`${name}Label`} className={labelClass} hidden={labelHidden || hidden} htmlFor={id}>
          {label}
        </FormLabel>
      )}
      {!check && inputRow}
    </FormGroup>
  );
}

ValidatedField.displayName = 'ValidatedField';

interface ValidatedBlobFieldProps extends ValidatedFieldProps {
  setValue: UseFormSetValue<{ [x: string]: any }> | undefined;
  defaultContentType?: string;
  isImage?: boolean;
  imageStyle?: Record<string, string>;
  imageClassName?: string;
  clearBtn?: (clearBlob: () => void) => React.ReactElement;
  openActionLabel?: string;
}

/**
 * A utility wrapper over React-Bootstrap FormGroup + FormLabel + FormControl for blobs and images.
 */
export function ValidatedBlobField({
  name,
  register,
  setValue,
  error,
  isTouched,
  isDirty,
  validate,
  children,
  className,
  onChange,
  onBlur,
  id = name,
  disabled,
  row,
  col,
  tag,
  label,
  labelClass,
  labelHidden,
  inputClass,
  inputTag,
  hidden,
  size,
  defaultValue,
  defaultContentType,
  isImage,
  imageStyle,
  imageClassName,
  clearBtn,
  openActionLabel,
  type,
  check,
  ...attributes
}: ValidatedBlobFieldProps): React.JSX.Element {
  const [blob, setBlobData] = useState<string>(defaultValue as string);
  const [blobContentType, setBlobContentType] = useState<string>(defaultContentType);

  const contentTypeName = `${name}ContentType`;

  const setBlobValue = (data, contentType) => {
    setBlobData(data);
    setBlobContentType(contentType);
    setValue && setValue(contentTypeName, contentType, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue && setValue(name, data, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };
  const clearBlob = () => {
    setBlobValue(null, null);
  };

  const renderFormGroup = inner => (
    <FormGroup as={tag} className={className} hidden={hidden}>
      {label && (
        <FormLabel id={`${name}Label`} className={labelClass} hidden={labelHidden || hidden} htmlFor={id}>
          {label}
        </FormLabel>
      )}
      {inner}
    </FormGroup>
  );

  const inputRow = input => (row ? <Col {...col}>{input}</Col> : input);
  const s = size === 1 ? "sm" : "lg";

  if (!register) {
    return renderFormGroup(
      inputRow(
        <FormControl
          type="file"
          id={id}
          size={s}
          name={name}
          className={className}
          onChange={onChange}
          onBlur={onBlur}
          {...attributes}
        />
      ),
    );
  }

  className = className || '';
  className = isTouched ? `${className} is-touched` : className;
  className = isDirty ? `${className} is-dirty` : className;

  useEffect(() => {
    register(name, validate);
    register(contentTypeName, validate);
  }, [register]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    setFileData(
      e,
      (contentType, data) => {
        setBlobValue(data, contentType);
      },
      isImage,
    );
    onChange && onChange(e);
  };

  const handleBlur = (e: React.FocusEvent<any>) => {
    setFileData(
      e,
      (contentType, data) => {
        setBlobValue(data, contentType);
      },
      isImage,
    );
    onBlur && onBlur(e);
  };

  const input = (
    <>
      <input id={`file_${name}_content_type`} name={contentTypeName} type="hidden" />
      <FormControl
        type="file"
        id={id}
        name={name}
        isValid={!!isTouched && !error}
        isInvalid={!!error}
        className={className}
        onChange={handleChange}
        onBlur={handleBlur}
        {...attributes}
      />
      {error && <FormControl.Feedback type="invalid">{error.message}</FormControl.Feedback>}
    </>
  );

  const defaultClearBtn = (
    <Button variant="danger" size="sm" onClick={clearBlob}>
      <strong>&nbsp;x&nbsp;</strong>
    </Button>
  );

  return renderFormGroup(
    <>
      <br />
      {blob ? (
        <div className="mb-3 mt-2 jhi-validated-blob-field-item-container">
          {blobContentType ? (
            <a onClick={openFile(blobContentType, blob)} className="jhi-validated-blob-field-item-anchor">
              {isImage ? (
                <img
                  src={`data:${blobContentType};base64,${blob}`}
                  style={imageStyle || { maxHeight: '100px' }}
                  className={imageClassName}
                />
              ) : (
                openActionLabel || 'Open'
              )}
            </a>
          ) : null}
          <br />
          <Row className="jhi-validated-blob-field-item-row">
            <Col md="11" className="jhi-validated-blob-field-item-row-col">
              <span>
                {blobContentType}, {byteSize(blob)}
              </span>
            </Col>
            <Col md="1" className="jhi-validated-blob-field-item-row-col jhi-validated-blob-field-item-clear-btn">
              {clearBtn ? clearBtn(clearBlob) : defaultClearBtn}
            </Col>
          </Row>
        </div>
      ) : null}
      {inputRow(input)}
    </>
  );
}

ValidatedBlobField.displayName = 'ValidatedBlobField';

const EMAIL_REGEXP =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

export function isEmail(value) {
  if (isEmpty(value)) return true;

  return EMAIL_REGEXP.test(value);
}