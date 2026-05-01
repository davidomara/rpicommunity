ALTER TABLE [dbo].[Withdrawal]
ADD [purpose] VARCHAR(32) NOT NULL
CONSTRAINT [Withdrawal_purpose_df] DEFAULT 'WELFARE';

CREATE INDEX [Withdrawal_purpose_idx] ON [dbo].[Withdrawal]([purpose]);
