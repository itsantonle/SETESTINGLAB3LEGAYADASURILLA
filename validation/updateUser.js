
export const updateUserValidationSchema = {
      password: {
          in: ['body'],
          isString: true,
          optional:true,
          isLength: {
              errorMessage: 'Password should be at least 6 chars long',
              options: { min: 6, max: 50 },
          },
      },
        username: {
            in: ['body'],
            isString: true,
            optional:true,
            isLength: {
                errorMessage: 'Username should be at least 3 chars long',
                options: { min: 3, max: 50 },
            },
        },
        email: {
            in: ['body'],
            optional:true,
            isEmail: true,
        },
        profilePicture: {
            in: ['body'],
            optional:true,
            isString: true,
        },
        id: {
            in: ['params'],
            isMongoId: true,
            errorMessage: 'Params Invalid MongoDB Id',
        },

  };